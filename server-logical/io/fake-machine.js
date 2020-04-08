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
                    countdown: 5,
                    gameresult: -5,
                    state: 0, //began & so on
                    user: machines.states[i].user_on_request.user,
                    id: Math.random()
                };
                machines.report_from_machine(i, {
                    user_on_request: false,
                    session: sess
                });

                var countdown = setInterval(() => {
                    sess.countdown--;
                    sess = JSON.parse(JSON.stringify(sess));
                    if (sess.countdown < 0) {
                        sess.countdown = 0;
                        sess.ended = Date.now();
                        clearInterval(countdown);
                        setTimeout(() => {
                            machines.report_from_machine(i, {
                                session: false
                            });
                        }, 1000);
                    }
                    machines.report_from_machine(i, {
                        user_on_request: false,
                        session: sess
                    });
                }, 1000);

            })(i);
        }
    }
});

machines.events.on("ctrl", (c) => {
    console.log(c);
});