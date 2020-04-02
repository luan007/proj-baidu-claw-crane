//misc
var throttle = require("../lib/throttle");
var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(require('serve-static')(process.cwd() + "/front-end/dist"));
app.use(bodyParser.json());
console.log("UserLink @ 9797")
server.listen(9797);

var machines = require("../model/machine");
var rooms = require("../model/room");
var sessions = require("../model/session");
var users = require("../model/user");

//realtime casts
//hooking user & stuff
function push_to_user(uid, path, pack) {}

function sanitize_user_data(data) {
    data = JSON.parse(JSON.stringify(data));
    delete data.token;
    delete data.quiz_token;
    delete data.anwser;
    delete data.anwser_due;
    delete data.mobile;
    return data;
}

users.events.on("db", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var uid = v.path[0];
        !interest_party[uid] && push_to_user(uid, "user", sanitize_user_data(users.db.data[uid]));
        interest_party[uid] = true;
    });
});

users.events.on("states", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var uid = v.path[0];
        !interest_party[uid] && push_to_user(uid, "state", sanitize_user_data(users.states[uid]));
        interest_party[uid] = true;
    });
});

users.events.on("token", (changes) => {
    // dont care
    // var interest_party = {};
    // changes.forEach((v) => {
    //     var uid = v.path[0];
    //     !interest_party[uid] && push_to_user(uid, "state", sanitize_user_data(users.states[uid]));
    //     interest_party[uid] = true;
    // });
});

sessions.events.on("activesession", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var sess = v.path[0];
        //check on session
        var session = sessions.try_to_get_session(sess);
        if (!session) return;
        var session_state = sessions.session_status(sess);
        var uid = session.user;
        !interest_party[uid] && push_to_user(uid, "session",
            // session_state == sessions.ACTIVE ? session : {}
            session
        );
        interest_party[uid] = true;
    });
});

function broadcast_room_states() {
    //send to everyone
    var room_info = {};
    for (var i in rooms.states) {
        room_info[i] = {
            users: rooms.states.users.length
        };
    }
    io.emit("room_states", room_info);
}

rooms.events.on("states", (changes) => {
    //compile all room info & send down
    throttle(broadcast_room_states, 50, "BCAST_ROOM");
});

rooms.events.on("chat", (chat_pack) => {
    //chat delivery
    var room = chat_pack.room;
    if (rooms.states[room]) return; //drop it
    //cast stuff to users in room
    rooms.states[room].users.forEach((v) => {
        push_to_user(v, "chat", chat_pack);
    });
});
