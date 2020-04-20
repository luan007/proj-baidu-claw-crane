import io from "socket.io-client";
export var main_socket = io("/");

export var synced = {
    machines: {},
    rooms: {},
    room_states: {},
    user: {},
    session: null,
    state: {}
};

export var ai_engine = {
    face_data: false,
    face_data_persist: false,
    engine_state: 0,
    face_sp: {
        mouth: 0,
        tiltLeft: 0,
        tiltRight: 0,
        tiltDown: 0,
        tiltUp: 0,
        turnLeft: 0,
        turnRight: 0
    },
    face_pos: {
        x: 0,
        y: 0
    },
    face_expr: {},
    main_expr: null
};

export var local_state = {
    dialog: "",
    chats: [],
    emojimap: {
        "disgusted": "🤨",
        "angry": "💪",
        "happy": "😂",
        "neutral": "👏",
        "sad": "😣",
        "surprised": "😱"
    },
    ai_engine: ai_engine,
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
    loading: false,
    synced: synced
};

main_socket.on("chat", e => {
    local_state.chats.push({
        pack: e,
        pos: {
            x: 100,
            y: Math.random() * 100
        },
        rpos: {
            x: Math.random() * 100,
            y: Math.random() * 100
        },
        life: 1,
        life_speed: Math.random() * 0.05 + 0.01,
        speed: (Math.random() + 1) * .5
    });
});

loop(() => {
    for (var i = 0; i < local_state.chats.length; i++) {
        local_state.chats[i].pos.x -= local_state.chats[i].speed;
        // local_state.chats[i].life -= local_state.chats[i].life_speed;
        if (local_state.chats[i].pos.x < -110 || local_state.chats[i].life < 0) {
            local_state.chats.splice(i, 1);
            i++;
        }
    }
});

export function active_game_in_room() {
    console.log(synced.state, synced.state.session)
    if (synced.state && synced.state.session) {
        for (var i in synced.room_states) {
            if (synced.room_states[i].session && synced.room_states[i].session.id == synced.state.session.id) {
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
    actions.is_logged_in(); //check again!
});

main_socket.on("error", (e) => {
    local_state.channel.log = "datastream: error " + e.toString();
    console.log('Socket Error:', e);
    local_state.channel.debug = [];
    local_state.channel.connected = -1;
    actions.is_logged_in(); //check again!
    //auth failed

});

main_socket.on("disconnect", () => {
    console.log("disconnected.")
    local_state.channel.debug = [];
    local_state.channel.log = "datastream: lost";
    local_state.channel.connected = -2;
    actions.is_logged_in(); //check again!
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


var _bad_record = false;
export var actions = {
    is_in_game() {
        return !!synced.state.session &&
            synced.state.room_id &&
            synced.room_states[synced.state.room_id].session &&
            synced.room_states[synced.state.room_id].session.id == synced.state.session.id;
    },
    is_logged_in: () => {
        request_promise("is_logged_in", {})
            .then(d => {
                if (d.error) {
                    console.log("login failed");
                    local_state.login.login = 0;
                    _bad_record = true;
                } else {
                    local_state.login.login = 1;
                    if (_bad_record) {
                        console.log("need to refresh..");
                        location.reload();
                    }
                    //let's reconnect.. as stream might suck
                }
            })
            .catch(e => {
                console.log("network_error_need_retry?");
                local_state.login.login = 1;
                _bad_record = false;
            });
    },
    cur_is_logged_in: () => {
        return local_state.login.login > 0;
    },
    clear_quiz: function () {
        local_state.login.log = "";
        local_state.login.login_token = false;
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
                if (v.error == -5) {
                    alert("硬币不足～请充值");
                } else {
                    alert("设备或网络原因，上机失败");
                }
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
    add_coin: (amt) => {
        request_promise("add_coin", {
            amount: amt
        }).then(v => {
            if (v.error) {
                local_state.generic_error = v.error
            }
        }).catch(e => {
            local_state.generic_error = e.toString();
        });
    },
    send_chat: (pack) => {
        pack = pack || {
            emoji: "test"
        };
        main_socket.emit("chat", pack);
    },
    send_emoji: (emoji) => {
        // pack = pack || {
        //     emoji: "test"
        // };
        var emo = local_state.emojimap[emoji];
        if(!emo) return;
        main_socket.emit("chat", {
            emoji: emo
        });
        console.log(emoji);
    },
    set_loading() {
        local_state.loading = 1;
    },
    clear_loading() {
        local_state.loading = 0;
    },
    show_dialog(x) {
        local_state.dialog = x;
    },
    close_dialog(x) {
        if ((x && local_state.dialog == x) || !x) {
            local_state.dialog = null;
        }
    },
    send_cmd: (pack) => {
        //ready?
        if (actions.is_in_game()) {
            console.log("streaming control", pack);
            main_socket.emit("control", pack);
        }
    },
    pick_room(room_id) {
        if (room_id == vueData.picked_room) {
            actions.join_room(room_id);
        }
        vueData.picked_room = room_id;
    },
    get_room_state(room_id) {
        if (!synced.room_states[room_id]) {
            return {
                state: 404,
                emoji: "❓",
                error: true,
                message: "设备未找到"
            };
        };
        if (synced.room_states[room_id]) {
            if (synced.room_states[room_id].session) {
                return {
                    state: 2,
                    emoji: "⏳",
                    message: "游戏中"
                };
            }
            if (synced.room_states[room_id].machine_up) {
                return {
                    state: 1,
                    emoji: "🎮",
                    message: "在线"
                };
            } else {
                return {
                    state: -1,
                    emoji: "❌",
                    message: "设备故障"
                };
            }
        };
        return {
            state: 500,
            message: "❓",
            error: true
        };
    },
    room_machine(room_id) {
        return synced.machines[synced.rooms[room_id].machine];
    },
    current_room_id() {
        try {
            return synced.state.room_id;
        } catch (e) {
            console.log(e);
        }
    },
    current_room_state() {
        try {
            return synced.room_states[synced.state.room_id];
        } catch (e) {}
    },
    current_room_session() {
        try {
            return actions.current_room_state().session;
        } catch (e) {}
    },
    current_machine_id() {
        try {
            return actions.room_machine(synced.state.room_id).id;
        } catch (e) {
            console.log(e);
        }
    }
};

loop(() => {
    //ensure login dialog goes first
    if (local_state.login.login > 0) {
        actions.close_dialog("login");
    } else if (local_state.login.login <= 0) {
        actions.show_dialog("login");
    }
})

setInterval(() => {
    if (local_state.login.login > 0) return;
    actions.is_logged_in();
}, 1000);


import * as faceapi from "./faceapi/face-api";
import {
    vueData
} from "./shared";
import {
    loop
} from "./libao_stripped";
export var facevid = document.createElement('video');
document.body.appendChild(facevid);


facevid.style.visibility; // = 'hidden'
facevid.style.position = "fixed";
facevid.style["z-index"] = -9999;
facevid.style["pointer-events"] = "none";
facevid.style.top = 0;
facevid.style.bottom = 0;
facevid.style.left = 0;
facevid.style.right = 0;
facevid.muted = true;
facevid.setAttribute('playsinline', '');
facevid.autoplay = true;

function _dist(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

function compute_face(face) {
    if (!face) {
        return;
    }
    ai_engine.face_expr = face.expressions;
    var box = face.alignedRect.relativeBox;
    var _x = (box.x + box.width / 2)
    var _y = box.y + box.height / 2;
    ai_engine.face_pos.x = _x;
    ai_engine.face_pos.y = _y;
    // console.log(_x, _y);



    var max = 0.4;
    var max_k = null;
    for (var i in ai_engine.face_expr) {
        if (i == 'angry') {
            ai_engine.face_expr[i] *= 10;
        }
        if (i == 'sad') {
            ai_engine.face_expr[i] *= 4;
        }
        if (ai_engine.face_expr[i] > max) {
            max = ai_engine.face_expr[i];
            max_k = i;
        }
    }
    // var leye = face.landmarks.getMouth();
    ai_engine.main_expr = max_k;
    // var dists = [];
    // for (var d = 0; d < leye.length; d++) {

    // dists.push(Math.sqrt(Math.abs(leye[1].y - leye[d].y) +
    //     Math.abs(leye[1].x - leye[d].x)));
    // }

    // ai_engine.face_sp.mouth = 
    var mouth_1 = face.landmarks.relativePositions[63];
    var mouth_2 = face.landmarks.relativePositions[67];

    ai_engine.face_sp.mouth = _dist(mouth_1, mouth_2) > 0.15;


    var noseTip = face.landmarks.relativePositions[27];
    var nose = face.landmarks.relativePositions[33];
    var faceL = face.landmarks.relativePositions[1];
    var faceR = face.landmarks.relativePositions[15];

    var distL = Math.abs(nose.x - faceL.x);
    var distR = Math.abs(nose.x - faceR.x);
    // console.log(Math.abs(nose.x - faceL.x));
    var turnRight = distL < 0.25 && distR > 0.5;
    var turnLeft = distR < 0.25 && distL > 0.5;

    var tiltLeft = nose.x - noseTip.x > 0.08;
    var tiltRight = nose.x - noseTip.x < -0.08;

    var tiltUp = nose.y < ((faceL.y + faceR.y) * 0.5) - 0.1;
    var tiltDown = nose.y - (((faceL.y + faceR.y) * 0.5)) > 0.2;
    // console.log(turnRight, turnLeft);
    ai_engine.face_sp.tiltDown = tiltDown;
    ai_engine.face_sp.tiltUp = tiltUp;
    ai_engine.face_sp.tiltLeft = tiltLeft;
    ai_engine.face_sp.tiltRight = tiltRight;
    ai_engine.face_sp.turnRight = turnRight;
    ai_engine.face_sp.turnLeft = turnLeft;
    // console.log(tiltLeft, tiltRight, tiltUp, tiltDown);
}

function check_userMedia() {
    return !!navigator.getUserMedia || !!navigator.mediaDevices;
}
if (!check_userMedia()) {
    alert("为支持人脸识别，请尝试用系统浏览器打开");
    ai_engine.engine_state = -1; //error
} else {
    //face stuff
    ai_engine.engine_state = 1;
    local_state.loading = 1;
    Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
            faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models")
        ])
        .then(() => {
            var first = true;
            var on_success = stream => {
                ai_engine.engine_state = 2; //good
                facevid.srcObject = stream;
                var vid = facevid;
                var busy = false;
                setInterval(v => {
                    faceapi
                        .detectSingleFace(
                            vid,
                            new faceapi.TinyFaceDetectorOptions({
                                inputSize: 256,
                                scoreThreshold: 0.3
                            })
                        )
                        .withFaceLandmarks()
                        .withFaceExpressions()
                        .then(v => {
                            if (first) {
                                local_state.loading = 0;
                            }
                            first = false;
                            ai_engine.face_data = v;
                            if (v) {
                                if (ai_engine.face_data) {
                                    ai_engine.face_data_persist = ai_engine.face_data;
                                }
                                compute_face(ai_engine.face_data);
                            }
                            busy = false;
                        })
                        .catch(e => {
                            if (first) {
                                local_state.loading = 0;
                            }
                            first = false;
                            busy = false;
                            // console.log(e);
                        });
                    busy = true;
                    //52346555
                }, 300);
            };
            var onerror = (e) => {
                local_state.loading = 0;
                alert("未允许视频权限，无法进行游戏");
                alert(e);
                ai_engine.engine_state = -2; //error
            };

            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    video: {
                        facingMode: 'user'
                    },
                    audio: false
                }, on_success, onerror);
            } else {
                navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'user'
                        },
                        audio: false
                    })
                    .then(on_success)
                    .catch(onerror);
            }
        })
        .catch(() => {
            ai_engine.engine_state = -3; //error
        });
}