//---INCLUDES
var uuid = require('uuid');

//---DATA BASE
var Observable = require("../lib/observer").Observable;
var presist = require("../lib/presist");
var userstates = Observable.from({}); //runtime stuff
function __ensure_user_state(uid) {
    userstates[uid] = userstates[uid] || {};
}

var userdb = presist("user", {});
var tokendb = presist("token", {}); //login to uid token pairs

//----EVENT EMITTERS
var event_endpoint = require("eventemitter2");
var emitter = new event_endpoint.EventEmitter2({
    wildcard: true
});
userstates.observe((changes) => {
    emitter.emit("states", changes);
});
userdb.event.on("observe", (changes) => {
    emitter.emit("db", changes);
});
tokendb.event.on("observe", (changes) => {
    emitter.emit("token", changes);
});

//----LOGIC BLOCKS
function is_user_phone_legal(phone_or_uid) {
    reg = /^1(3|4|5|7|8)\d{9}$/;
    return reg.test(phone_or_uid);
}

function user_is_up(uid) {
    return userstates[uid] && userstates[uid].up;
}

function user_valid_for_session(uid) {
    if (user_is_up(uid) && !userstates[uid].session) {
        return true;
    }
    return false;
}

function get_or_create_user_by_uid(phone_or_uid) {
    if (!is_user_phone_legal) {
        return null;
    }
    __ensure_user_state(phone_or_uid);
    userdb.data[phone_or_uid] = userdb.data[phone_or_uid] || {
        public: {
            name: "",
            settings: ""
        },
        private: {
            coin: 0,
            pickup_info: ""
        },
        sessions: {},
        token: Math.random(),
        quiz_token: "",
        anwser: Math.random(),
        anwser_due: 0,
        uid: phone_or_uid,
    };
    return userdb.data[phone_or_uid];
}

function invalidate_token(token) {
    delete tokendb.data[token];
}

function get_current_user(token) {
    if (!tokendb.data[token]) {
        return null;
    }
    //expire
    //if(tokendb.data[token].expire < Date.now()) 
    //user-agent
    //if(tokendb.data[token].useragent) 
    var invalidated = false;
    var tokenuid = tokendb.data[token].uid;
    if (!userdb.data[tokenuid]) {
        console.error("Security alert, token exists but user doesn't, breach?")
        invalidated = true;
    } else if (userdb.data[tokenuid].token != token) {
        //invalid token
        invalidated = true;
    }
    if (invalidated) {
        invalidate_token(token);
        return null;
    }
    return userdb.data[tokenuid];
}



function is_logged_in(token) {
    return get_current_user(token) != null;
}

function logout(uid) {
    var user = get_or_create_user_by_uid(uid);
    user ? (user.token = "") : 0;
}

function login_quiz(uid) {
    var user = get_or_create_user_by_uid(uid);
    if (user) {
        user.anwser_due = Date.now() + 120 * 1000;
        user.anwser = 9999;
        user.quiz_token = uuid.v4();
        // console.log("TODO: Impl SMS Check here");
        return user.quiz_token;
    }
    return false;
}

function login(quiz_token, anwser, useragent) {
    //this is rather inefficient, should create sth like a reverse mapping table between quiz_token & user
    var found = null;
    for (var i in userdb.data) {
        if (userdb.data[i].quiz_token == quiz_token) {
            found = userdb.data[i];
            break;
        }
    }
    if (!found) return false;
    if (Date.now() > userdb.data[i].anwser_due || userdb.data[i].anwser !== anwser) {
        return false;
    }
    userdb.data[i].anwser_due = 0;
    userdb.data[i].anwser = Math.random();
    var token_key = uuid.v4();
    var token = {
        uid: found.uid,
        useragent: useragent,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7
    };
    userdb.data[i].token = token_key;
    tokendb.data[token_key] = token;
    return token_key;
}

function user_online(uid) {
    __ensure_user_state(uid);
    userstates[uid].up = true;
    emitter.emit("up", uid);
}

function user_offline(uid) {
    __ensure_user_state(uid);
    userstates[uid].up = false;
    emitter.emit("down", uid);
}

function add_coin(uid, count) {
    if (!userdb.data[uid]) return -1;
    userdb.data[uid].private.coin += count;
    return userdb.data[uid].private.coin;
}

var INVALIDATE_TOKEN_TIME = 1000;

function __invalidate_token_guard() {
    for (var i in tokendb.data) {
        if (Date.now() > tokendb.data[i].expire ||
            userdb.data[tokendb.data[i].uid].token != i) {
            invalidate_token(i);
        }
    }
}

setInterval(__invalidate_token_guard, INVALIDATE_TOKEN_TIME);

//---EXPORTS

module.exports.db = userdb;
module.exports.tokendb = tokendb;
module.exports.states = userstates;

module.exports.events = emitter;

module.exports.add_coin = add_coin;
module.exports.login = login;
module.exports.login_quiz = login_quiz;
module.exports.logout = logout;
module.exports.is_logged_in = is_logged_in;
module.exports.get_current_user = get_current_user;
module.exports.invalidate_token = invalidate_token;
module.exports.get_or_create_user_by_uid = get_or_create_user_by_uid;
module.exports.is_user_phone_legal = is_user_phone_legal;
module.exports.user_online = user_online;
module.exports.user_offline = user_offline;
module.exports.user_valid_for_session = user_valid_for_session;

presist.dump("user-state", userstates);