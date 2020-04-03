var machines = require("../model/machine");


setInterval(() => {
    // for (var i in machines.states) {
    //     machines.report_from_machine(
    //         i, {});
    // }
    machines.report_from_machine(
        "test_machine", {});
}, 500);


machines.events.on("states", (changes) => {
    for (var i in machines.states) {
        if (machines.states[i].user_on_request) {
            ((i) => {
                //start a session
                var sess = {
                    started: Date.now(),
                    ended: 0,
                    machine: i,
                    countdown: 60,
                    gameresult: -5,
                    state: 0, //began & so on
                    user: machines.states[i].user_on_request.user,
                    id: Math.random()
                };
                machines.report_from_machine(i, {
                    user_on_request: false,
                    session: sess
                });
                setTimeout(() => {
                    sess = JSON.parse(JSON.stringify(sess));
                    sess.ended = Date.now();
                    machines.report_from_machine(i, {
                        user_on_request: false,
                        session: sess
                    });
                }, 5000);

                setTimeout(() => {
                    machines.report_from_machine(i, {
                        session: false
                    });
                }, 5500);
            })(i);
        }
    }
});

machines.events.on("ctrl", (c) => {
    console.log(c);
});