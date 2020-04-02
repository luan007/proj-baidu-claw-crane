import io from "socket.io-client";
export var main_socket = io(":9797")
console.log(
    "hitting loading"
)

export var synced = {
    machines: {},
    rooms: {},
    room_states: {},
    user: {},
    session: null,
    state: {}
};
export var local_state = {
    generic_error: "",
    channel: {
        connected: false,
        log: "",
        debug: []
    },
    login: {
        login: -1,
        login_token: false,
        phone_number: "",
        anwser: "",
        log: ""
    },
    synced: synced
};

export function active_game_in_room() {
    if (synced.state && synced.state.session) {
        for (var i in synced.room_states) {
            if (synced.room_states[i].session.id == synced.state.session.id) {
                return i;
            }
        }
        return null;
    } else {
        return null;
    }
}

window.local_state = local_state;
window.synced = synced;
window.main_socket = main_socket;

main_socket.on("DEBUG", (e) => {
    local_state.channel.debug.unshift(e);
});

main_socket.on("user", (e) => {
    synced.user = e;
});

main_socket.on("state", (e) => {
    synced.state = e;
});

main_socket.on("info", (e) => {
    synced.machines = e.machines;
    synced.rooms = e.rooms;
});

main_socket.on("session", (e) => {
    synced.session = e;
});

main_socket.on("room_states", (e) => {
    synced.room_states = e;
});

main_socket.on("connect", (e) => {
    local_state.channel.log = "datastream: connected";
    local_state.channel.debug = [];
    local_state.channel.connected = 1;
});

main_socket.on("error", (e) => {
    local_state.channel.log = "datastream: error " + e.toString();
    console.log('Socket Error:', e);
    local_state.channel.debug = [];
    local_state.channel.connected = -1;
});


main_socket.on("disconnect", () => {
    console.log("disconnected.")
    local_state.channel.debug = [];
    local_state.channel.log = "datastream: lost";
    local_state.channel.connected = -2;
});



export function change_login_state() {
    if (local_state.login.login == -1 || local_state.login.login == 0) {
        //ensure stuff are done
        try {
            main_socket.close();
        } catch (e) {}
    } else if (local_state.login.login == 1) {
        try {
            main_socket.connect();
        } catch (e) {}
    }
}


export function request_promise(action, data) {
    console.log(action, data);
    return fetch("/actions/" + action, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        })
        .then(response => response.json())
}

window.request_promise = request_promise;

export var actions = {
    is_logged_in: () => {
        request_promise("is_logged_in", {})
            .then(d => {
                if (d.error) {
                    console.log("login failed");
                    local_state.login.login = 0;
                } else {
                    local_state.login.login = 1;
                }
            })
            .catch(e => {
                console.log("login failed");
                local_state.login.login = 0;
            });
    },
    req_login: () => {
        local_state.login.log = "";
        request_promise("stage1_login", {
                phone: local_state.login.phone_number
            })
            .then(d => {
                if (d.error) {
                    local_state.login.log = "失败 / " + d.error;
                } else {
                    local_state.login.login_token = d.token;
                }
            })
            .catch(e => {
                local_state.login.log = "失败 / " + e.message;
            });
    },
    req_quiz: () => {
        local_state.login.log = "";
        request_promise("stage2_login", {
                token: local_state.login.login_token,
                anwser: local_state.login.anwser
            })
            .then(d => {
                if (d.error) {
                    local_state.login.log = "失败 / " + d.error;
                } else {
                    //logged in
                    actions.is_logged_in();
                }
            })
            .catch(e => {
                local_state.login.log = "失败 / " + e.message;
            });
    },
    start_game: (machine_id) => {
        // /actions/start_game/:machine_id
        request_promise("start_game/" + machine_id).then(v => {
            if (v.error) {
                alert(v.error);
            }
        }).catch(e => {
            alert(e);
        });
    },
    join_room: (id) => {
        request_promise("change_room/" + id).then(v => {
            if (v.error) {
                local_state.generic_error = v.error
            }
        }).catch(e => {
            local_state.generic_error = e.toString();
        });
    },
    add_coin: () => {
        request_promise("add_coin").then(v => {
            if (v.error) {
                local_state.generic_error = v.error
            }
        }).catch(e => {
            local_state.generic_error = e.toString();
        });
    },
    send_chat: (pack) => {
        main_socket.emit("chat", pack);
    }
};

actions._clear_quiz = function () {
    local_state.login.log = "";
    local_state.login.login_token = false;
};