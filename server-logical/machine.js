var events = require('events');
const DEVICE_NO_AUTH_TIMEOUT = 3000; //3sec no auth?

var machine_config = {
    test_machine: {
        key: 38193, //optional
        uplink: "http://localhost:8081/test",
        downlink: "http://localhost:8082/"
    }
};

var machine_emitters = {};

var machine_states = {
    test_machine: {
        game_state: 0,
        active_user: 0,
        message: "",
        lastupdate: 0
    }
};

for (var i in machine_config) {
    machine_emitters[i] = new events.EventEmitter();
}

var machine_sockets = {};

//device link use dedicated port (for easier routing purposes maybe)
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var dev = io; //as for now

dev.on('connection', function (socket) {
    var device_id, deauth_timer;

    socket.on("disconnect", () => {
        try {
            machine_states[device_id].lastupdate = 0;
        } catch (e) {}
        try {
            delete machine_sockets[device_id];
        } catch (E) {

        }
        machine_emitters[device_id].emit("disconnect")
    });

    function auth() {
        machine_emitters[device_id].emit("auth")
        clearTimeout(deauth_timer);
        console.log("Device auth success:\t" + device_id);
        var state = machine_states[device_id];
        socket.on("state", (dt) => {
            var changed = false;
            for (var i in dt) {
                if (state[i] != dt[i]) {
                    changed = true;
                }
                state[i] = dt[i];
            }
            if (changed) {
                machine_emitters[device_id].emit("state", state[i])
            }
            state.lastupdate = Date.now();
            machine_emitters[device_id].emit("heartbeat", state[i])
        });
        socket.on("newgame", (gs) => {
            machine_emitters[device_id].emit("newgame", gs)
        });
        socket.on("result", (gs) => {
            machine_emitters[device_id].emit("result", gs)
        });
        socket.emit("config", machine_config[device_id]);
        machine_sockets[device_id] = socket;
    }

    function drop(reason) {
        console.log("Device dropped:\t" + reason)
        return socket.disconnect(true);
    }

    socket.once("auth", (pack) => {
        try {
            device_id = pack.device_id;
            if (machine_sockets[device_id]) {
                //drop this one
                return drop("socket already up");
            }
            if (machine_config[device_id] && machine_config[device_id].key == pack.device_key) {
                auth();
            } else {
                drop("Invalid auth");
            }
        } catch (e) {
            drop(e.message);
        }
    });
    deauth_timer = setTimeout(() => {
        drop('Auth timeout')
    }, DEVICE_NO_AUTH_TIMEOUT);

});

function get_machine_sock(machine_id) {
    if (machine_states[machine_id] && machine_sockets[machine_id]) {
        return machine_sockets[machine_id];
    }
}

function new_game(machine_id, user_id) {
    var sock = get_machine_sock(machine_id);
    if (!sock) return;
    sock.emit("newgame", {
        user_id: user_id
    });
}

function panel_stream(machine_id, user_id, v_panel) {
    var sock = get_machine_sock(machine_id);
    if (!sock) return;
    if (machine_states[machine_id].active_user == user_id) {
        //send command down
        sock.emit("stream", {
            user: user_id, //for end check :)
            panel: v_panel
        });
    }
}

console.log("Devlink @ 9898")
server.listen(9898); //device link

module.exports.configs = machine_config;
module.exports.emitters = machine_emitters;
module.exports.sockets = machine_sockets;
module.exports.states = machine_states;
module.exports.get_machine_sock = get_machine_sock;
module.exports.new_game = new_game;
module.exports.panel_stream = panel_stream;
