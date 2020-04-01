//---INCLUDES
var users = require("./user");
var machines = require("./machine");

//---DATA BASE
var presist = require("../lib/presist");
var historysession = presist("session_history", {});
var activesessions = presist("session_active", {});

//---EVENT EMITTERS
var event_endpoint = require("eventemitter2");
var emitter = new event_endpoint.EventEmitter2({
    wildcard: true
});
activesessions.event.on("observe", (changes) => {
    emitter.emit("activesession", changes);
});


var ACTIVE = 1;
var HISTORY = 2;
var BAD = 3;

function session_status(id) {
    if (activesessions.data[id]) return ACTIVE;
    if (historysession.data[id]) return HISTORY;
    return BAD;
}

function try_to_get_session(id) {
    if (activesessions.data[id]) return activesessions.data[id];
    if (historysession.data[id]) return historysession.data[id];
}

function __active_session_down(i) {
    //letting user know
    var session_obj = activesessions.data[i]
    if (activesessions.data[i] && !historysession.data[i]) {
        historysession.data[i] = JSON.parse(JSON.stringify(activesessions.data[i]));
        emitter.emit("session_down", activesessions.data[i]);
        delete activesessions.data[i];
    }
    if (session_obj && users.states[session_obj.user] && users.states[session_obj.user].session == i) {
        users.states[session_obj.user].session = false;
    }
}

function session_sync(id, session_obj) {
    //from else where
    var state = session_status(id);
    if (state == ACTIVE) {
        if (JSON.stringify(activesessions.data[id]) != JSON.stringify(session_obj)) {
            for (var i in session_obj) {
                activesessions.data[id][i] = session_obj[i];
            }
            emitter.emit("session_changed", activesessions.data[id]);
        }
    } else if (state == HISTORY) {
        //bad bad
    } else {
        //new ?
        __session_up(id, session_obj);
    }
}

machines.events.on('states', (changes) => {
    //this is gonna be crazy
    var need_update = false;
    for (var i in changes) {
        if (changes[i].path.indexOf("session") > -1) {
            need_update = true;
            break;
        }
    }
    if (!need_update) return;
    console.warn("Looping through devices during machine_state for sessions");
    for (var i in machines.states) {
        if (machines.states[i].session) {
            session_sync(machines.states[i].session.id, machines.states[i].session);
        }
    }
});

function __session_up(id, session_obj) {
    //letting user know
    activesessions.data[id] = session_obj;
    //ensure user has this session
    if (users.db.data[session_obj.user]) {
        users.db.data[session_obj.user].sessions[id] = Date.now();
    }
    if (users.states[session_obj.user]) {
        users.states[session_obj.user].session = id;
    }
    emitter.emit("session_up", activesessions.data[id]);
}

var SWEEP_DEAD_SESSION_INTERVAL = 500
var SESSION_MAX_TIME = 60 * 1000;
var SESSION_TIMEOUT = SESSION_MAX_TIME + 5000; //65sec byebye
function __session_sweep() {
    //let's see if shit happens
    for (var i in activesessions.data) {
        //dead?
        if (activesessions.data[i].ended || Date.now() > SESSION_TIMEOUT + activesessions.data[i].started) {
            __active_session_down(i); //timeout or ended
            continue;
        }
        var machine = machines.states[activesessions.data[i].machine];
        // console.log(machine);
        if (!machine || !machine.session || machine.session.id != i) {
            __active_session_down(i);
            continue;
        }
    }
}
setInterval(__session_sweep, SWEEP_DEAD_SESSION_INTERVAL);

var SESSION_REQ_EXPIRE = 5000;

function request_new_session(uid, machine_id, cost) {
    //valid?
    var user = users.db.data[uid];
    var machine = machines.states[machine_id];
    if (!machine || !user) {
        return -1;
    }
    if (!machines.machine_valid_for_session(machine_id)) {
        return -2;
    }
    if (!users.user_valid_for_session(uid)) {
        return -3;
    }
    if (user.private.coin > cost) {
        user.private.coin -= cost;
        machine.user_on_request = {
            user: uid,
            expire: Date.now() + SESSION_REQ_EXPIRE
        };
        return 1;
    }
    return -5;
}

function from_user(uid) {
    if (!users.states[uid] || !users.states[uid].session) return null;
    var sid = users.states[uid].session;
    if (session_status(sid) == ACTIVE ) {
        var session = activesessions.data[sid];
        if(session.user == uid) {
            return session;
        }
    } else {
        return null;
    }
}

module.exports.events = emitter;
module.exports.request_new_session = request_new_session;
module.exports.try_to_get_session = try_to_get_session;
module.exports.from_user = from_user;
module.exports.session_sync = session_sync;
module.exports.session_status = session_status;