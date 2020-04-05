var cors = require("cors");
var app = require("express")();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
console.log("Machine Link @ 9898")
server.listen(9898);

var machines = require("../model/machine");
var machine_states = machines.states;
var machine_data = machines.db.data;

var machine_sockets = {};

io.use((sock, next) => {
    var token = sock.handshake.query.token;
    console.log(token);
    var machine = null;
    var machine_state = null;
    var mid = "";
    for (var i in machine_data) {
        if (machine_data[i].private.token == token) {
            machine = machine_data[i];
            machine_state = machine_states[i];
            mid = i;
            break;
        }
    }
    if (machine && machine_state) {
        sock.machine = machine;
        sock.machine_state = machine_state;
        sock.mid = mid;
        if (machine_sockets[mid]) {
            try {
                machine_sockets[mid].disconnect();
            } catch (e) {}
        }
        machine_sockets[mid] = sock;
        return next();
    }
    return next(new Error('authentication error'));
});

function send_state(mid) {
    machine_sockets[mid] && machine_sockets[mid].emit("state", machine_states[mid]);
}

function send_data(mid) {
    machine_sockets[mid] && machine_sockets[mid].emit("data", machine_data[mid]);
}

io.on("connection", (sock) => {
    var mid = sock.mid;
    var machine = sock.machine;
    var machine_state = sock.machine_state;
    sock.on("disconnect", () => {
        if (machine_sockets[mid] == sock) {
            delete machine_sockets[mid];
        }
    });
    sock.on("report", (package) => {
        machines.report_from_machine(mid, package);
    });
    send_state(mid);
    send_data(mid);
});

machines.events.on("ctrl", (c) => {
    // this is safe
    var machine = c.machine;
    if (machine_sockets[machine]) {
        machine_sockets[machine].emit("ctrl", c.cmd);
    }
});


machines.events.on("states", (changes) => {
    var sent = {};
    changes.forEach((v) => {
        var machine = v.path[0];
        if (sent[machine]) {
            return;
        }
        sent[machine] = true;
        send_state(machine);
    });
});
// machines.events.on("states", (changes) => {
//     for (var i in machines.states) {
//         if (machines.states[i].user_on_request) {
//             ((i) => {
//                 //start a session
//                 var sess = {
//                     started: Date.now(),
//                     ended: 0,
//                     machine: i,
//                     countdown: 60,
//                     gameresult: -5,
//                     state: 0, //began & so on
//                     user: machines.states[i].user_on_request.user,
//                     id: Math.random()
//                 };
//                 machines.report_from_machine(i, {
//                     user_on_request: false,
//                     session: sess
//                 });
//                 setTimeout(() => {
//                     sess = JSON.parse(JSON.stringify(sess));
//                     sess.ended = Date.now();
//                     machines.report_from_machine(i, {
//                         user_on_request: false,
//                         session: sess
//                     });
//                 }, 5000);

//                 setTimeout(() => {
//                     machines.report_from_machine(i, {
//                         session: false
//                     });
//                 }, 5500);
//             })(i);
//         }
//     }
// });