var machines = require("./machine");
var rooms = require("./room");
var sessions = require("./session");
var users = require("./user");

// machines.events.onAny((nm, c) => {
//     console.log('EVT - MACHINE', nm)
//     Array.isArray(c) ? null : console.log(c)
// })
rooms.events.onAny((nm, c) => {
    console.log('EVT - ROOM', nm)
    Array.isArray(c) ? null : console.log(c)
})
sessions.events.onAny((nm, c) => {
    console.log('EVT - SESSION', nm)
    Array.isArray(c) ? null : console.log(c)
})
users.events.onAny((nm, c) => {
    console.log('EVT - USERS', nm)
    Array.isArray(c) ? null : console.log(c)
})


function simulate_a_game(id, user, session_id) {
    setTimeout(() => {
        machines.report_from_machine(id, {
            session: {
                started: Date.now(),
                ended: 0,
                machine: id,
                countdown: 60,
                gameresult: -5,
                state: 0, //began & so on
                user: user,
                id: session_id
            }
        });
    }, 1000);

    setTimeout(() => {
        machines.report_from_machine(id, {
            session: {
                started: Date.now(),
                ended: Date.now(),
                machine: id,
                countdown: 60,
                gameresult: 5,
                state: 0, //began & so on
                user: user,
                id: session_id
            }
        });
    }, 5000);

    setTimeout(() => {
        machines.report_from_machine(id, {
            session: false
        });
    }, 5500);
}


machines.events.on("states", (c) => {
    c.forEach(v => {
        if (v.path.indexOf("user_on_request") > -1) {
            if (v.object.user_on_request) {
                //simulate machine response
                console.log("Simulate Game!");
                simulate_a_game(
                    v.object.id,
                    v.object.user_on_request.user,
                    Math.random()
                );
            }
        }
    });
})

var perf = require("../lib/presist").STATS;

console.log("Inited");
users.get_or_create_user_by_uid("15801397431");
var token = users.login_quiz("15801397431");
var login = users.login(token, 9999, "TEST-UA");
console.log("Login result:", login, users.is_logged_in(login));
console.log(users.get_current_user(login));
console.log("try to login again", users.login(token, 3333, "TEST-UA"));
var userid = users.get_current_user(login).uid;
users.user_online(userid);
users.states[userid].room_id = "demo_room";
users.user_offline(userid);
users.user_online(userid);
users.states[userid].room_id = "demo2";
users.user_offline(userid);
users.user_online(userid);
users.add_coin(userid, 10);
machines.report_from_machine("test_machine", {});
setInterval(() => {
    machines.report_from_machine("test_machine", {});
}, 500)
console.log(sessions.request_new_session("15801397431", "test_machine", 1));
console.log(sessions.request_new_session("15801397431", "test_machine", 1));
console.log(sessions.request_new_session("15801397431", "test_machine", 1));
console.log(sessions.request_new_session("15801397431", "test_machine", 1));
console.log(sessions.request_new_session("15801397431", "test_machine", 1));
console.log(sessions.request_new_session("15801397431", "test_machine", 1));


setInterval(v => {
    //as a user, checking if me got the permission to control
    if (sessions.from_user(userid)) {
        console.log("USER CAN CONTROL MACHINE")
    }
}, 100);

console.log("IO", perf.IO);

setTimeout(() => {
    console.log(sessions.request_new_session("15801397431", "test_machine", 1));
}, 20000);