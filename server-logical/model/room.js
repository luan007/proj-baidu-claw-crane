//---INCLUDES
var users = require("./user");
var machines = require("./machine");

//---DATA BASE
var presist = require("../lib/presist");
var Observable = require("../lib/observer").Observable;
var roomstates = Observable.from({}); //runtime stuff
var roomdb = presist("rooms", {
    demo_room: {
        machine: "test_machine"
    },
    demo_room2: {
        machine: "test_machine2"
    },
    demo_room3: {
        machine: "test_machine3"
    }
});

//---EVENT EMITTERS
var event_endpoint = require("eventemitter2");
var emitter = new event_endpoint.EventEmitter2({
    wildcard: true
});
roomstates.observe((changes) => {
    emitter.emit("states", changes);
});
roomdb.event.on("observe", (changes) => {
    emitter.emit("db", changes);
});


function __build_room_states() {
    for (var i in roomdb.data) {
        roomstates[i] = {
            users: [] //cached user in room
        };
        __recompute_room_state(i);
    }
}
//---LOGIC

function __recompute_room_state(room_id) {
    //beware - this is heavy - but SAFE!
    console.warn("Potentially Heavy Op: recomputing room state")
    if (!roomstates[room_id]) {
        return;
    }
    roomstates[room_id].users = roomstates[room_id].users || [];
    var current_users = roomstates[room_id].users;
    var new_list = [];
    var overlap_count = 0;
    for (i in users.states) {
        var user = users.states[i];
        if (user && user.room_id == room_id && user.up) {
            new_list.push(i);
            if (current_users.indexOf(i)) {
                overlap_count++;
            }
        }
    }
    if (new_list.length == current_users.length && overlap_count == current_users.length) {
        //no change
    } else {
        roomstates[room_id].users = new_list;
    }
}

function get_room_id_from_machine(machine) {
    for(var i in roomdb.data) {
        if(roomdb.data[i].machine == machine) return i;
    }
    return null;
}
function recompute_room_states() {
    //from user state -> room state
    for (var i in users.states) {
        __recompute_room_state(i);
    }
}

function sendChat(room, msg) {
    emitter.emit("chat", {
        room: room,
        msg: msg
    })
}

function __update_singular_user(uid) {
    //find the user
    var user_state = users.states[uid];
    var room_id = user_state ? user_state.room_id : -1;

    if (user_state && !user_state.up) {
        room_id = -2; //kill it if user down
    }
    //remove all
    for (var i in roomstates) {
        var index = roomstates[i].users.indexOf(uid);
        if (i == room_id) {
            if (index == -1) {
                roomstates[i].users.push(uid); //add in
            }
        } else {
            if (index > -1) {
                roomstates[i].users.splice(index, 1); //remove
            }
        }
    }
}

users.events.on("states", (changes) => {
    changes.forEach((change) => {
        if (change.path.length > 1 && change.path.indexOf('room_id') >= 0) {
            var uid = change.path[0];
            __update_singular_user(uid);
        }
    });
});

users.events.on("down", (uid) => {
    __update_singular_user(uid);
});

users.events.on("up", (uid) => {
    __update_singular_user(uid);
});

//aggregate 
machines.events.on("states", (changes) => {
    //user_on_request
    //session
    //up
    //message
    changes.forEach(v=>{
        var dev = v.path[0];
        var machine = machines.states[dev];
        var room = get_room_id_from_machine(machine.id);
        if(!room) return;
        roomstates[room].machine_up = machine.up;
        roomstates[room].machine_message = machine.message;
        if(v.path.indexOf("session") || v.path.indexOf("user_on_request") >= 0) {
            //directly sync
            roomstates[room].session = machine.session;
            roomstates[room].user_on_request = machine.user_on_request;
        }
        /**
         *     "test_machine": {
        "up": true,
        "last_update": 1585812385323,
        "message": "",
        "user_on_request": {
            "expire": 1585812388819,
            "user": "77b32c7d17fac691ca7692f9dabb713b"
        },
        "id": "test_machine",
        "session": {
            "id": 0.4887547391775393,
            "user": "77b32c7d17fac691ca7692f9dabb713b",
            "state": 0,
            "gameresult": -5,
            "countdown": 60,
            "machine": "test_machine",
            "ended": 0,
            "started": 1585812384819
        }
    }
         */
    });
});

__build_room_states();

module.exports.events = emitter;
module.exports.db = roomdb;
module.exports.states = roomstates;
module.exports.get_room_id_from_machine = get_room_id_from_machine;
module.exports.sendChat = sendChat;
module.exports.recompute_room_states = recompute_room_states;

presist.dump("room-state", roomstates);
