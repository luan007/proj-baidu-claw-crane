//---DATA BASE
var presist = require("../lib/presist");
var Observable = require("../lib/observer").Observable;
var machinestates = Observable.from({}); //runtime stuff
var machinedb = presist("machine", {
    test_machine: {
        public: {
            intro: "test_machine",
            view_streams: ["http://localhost:8082/"]
        },
        private: {
            key: 38193, //optional
            push_streams: ["http://localhost:8081/test"],
        }
    }
});




//---LOGIC
function __build_machine_states() {
    for (var i in machinedb.data) {
        machinestates[i] = machinestates[i] || {
            session: false,
            id: i,
            user_on_request: false,
            /** {
             *  started: Date.now()?
             *  ended: Date.now() + ...
              * machine: xxx
                countdown: 0,
                gameresult: 0,
                state: 0, //began & so on
                user: -1,
                id: 0
            } */
            message: "",
            last_update: 0,
            up: false
        };
    }
}

function machine_is_up(id) {
    return machinestates[id] && machinestates[id].up;
}

function machine_valid_for_session(id) {
    if (!machine_is_up(id)) {
        return false;
    }
    return !machinestates[id].session && (
        (!machinestates[id].user_on_request ||
            Date.now() > machinestates[id].user_on_request.expire)
    )
}

var MACHINE_GUARD_INTERVAL = 1000;
var MACHINE_TIMEOUT = 1000 * 5;

function __guard_machine_quality() {
    for (var i in machinestates) {
        var _prev = machinestates[i].up;
        machinestates[i].up = (Date.now() - machinestates[i].last_update) < MACHINE_TIMEOUT;
        if (_prev != machinestates[i].up) {
            emitter.emit(machinestates[i].up ? "up" : "down", i);
        }
    }
}
setInterval(__guard_machine_quality, MACHINE_GUARD_INTERVAL);

function __guard_machine_user_on_request() {
    for (var i in machinestates) {
        if (machinestates[i].user_on_request && Date.now() > machinestates[i].user_on_request.expire) {
            machinestates[i].user_on_request = false;
        }
    }
}
setInterval(__guard_machine_user_on_request, 100);

function report_from_machine(machine_id, package) {
    if (!machinestates[machine_id]) return;
    for (var i in package) {
        if (machinestates[machine_id][i] != package[i]) {
            console.log("update_property", i);
            machinestates[machine_id][i] = package[i];
        }
    }
    machinestates[machine_id].up = true;
    machinestates[machine_id].last_update = Date.now();
}

//---EVENT EMITTERS
var event_endpoint = require("eventemitter2");
var emitter = new event_endpoint.EventEmitter2({
    wildcard: true
});
machinestates.observe((changes) => {
    emitter.emit("states", changes);
});
machinedb.event.on("observe", (changes) => {
    emitter.emit("db", changes);
});

__build_machine_states();

function send_command(machine_id, cmd) {
    if (machinestates[machine_id] && machinestates[machine_id].up) {
        emitter.emit("ctrl", {
            machine: machine_id,
            cmd: cmd
        })
    }
}

module.exports.db = machinedb;
module.exports.events = emitter;
module.exports.states = machinestates;
module.exports.send_command = send_command;
module.exports.report_from_machine = report_from_machine;
module.exports.machine_valid_for_session = machine_valid_for_session;

presist.dump("machine-state", machinestates);