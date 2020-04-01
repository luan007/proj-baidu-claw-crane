//---INCLUDES
var users = require("./user");
var uuid = require('uuid');

//---DATA BASE
var presist = require("../lib/presist");
var roomstates = Observable.from({}); //runtime stuff
var roomdb = presist("room", {
    demo_room: {
        machine: "demo_machine"
    }
});


//---EVENT EMITTERS
var event_endpoint = require("events");
var emitter = new event_endpoint.EventEmitter();
var Observable = require("../lib/observer").Observable;
roomstates.observe((changes) => {
    emitter.emit("states", changes);
});
roomdb.event.on("observe", (changes) => {
    emitter.emit("db", changes);
});

function __build_room_state() {
    for (var i in roomdb.data) {
        roomstates[i] = {
            users: [], //cached user in room
            session: -1
        };
    }
}

function __recompute_room_state(room_id) {
    //warning - this is heavy
    if (!roomstates[room_id]) {
        return;
    }
    var state = roomstates[room_id];
    
}

//---LOGIC
function __recompute_room_states() {
    //from user state -> room state
    for (var i in users.states) {
        var user_state = users.states[i];

    }
}

function sendChat() {

}

function enter() {

}