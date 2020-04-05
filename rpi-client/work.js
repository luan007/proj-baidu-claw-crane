var stream_pusher = require("./stream_pusher")

var sockio = require("socket.io-client");
var obs = require("./observer").Observable;
var io = sockio("http://localhost:9898", {
    query: {
        token: "super_secret_key"
    }
})


var machine = obs.from({
    state: {},
    data: {}
});

var local_state = obs.from({
    user_on_request: "",
    session: null
});

io.on("error", console.log);

io.on("state", function (_s) {
    for (var i in _s) {
        machine.state[i] = _s[i];
    }
});

io.on("data", function (_s) {
    for (var i in _s) {
        machine.data[i] = _s[i];
        if (_s[i].push_streams) {
            _s[i].push_streams.forEach((v) => {
                stream_pusher.start_worker(v);
            });
        }
    }
});

setInterval(() => {
    io.emit("report", {})
}, 1000);

function start_game(g) {
    if (!local_state.user_on_request) return;
    send_cmd(cmd_add_coin(1));
    local_state.session = {
        started: Date.now(),
        ended: 0,
        machine: machine.data.id,
        countdown: 20,
        gameresult: -1,
        state: 0, //began & so on
        user: local_state.user_on_request,
        id: Math.random()
    }
    local_state.user_on_request = false;
    // console.log(local_state.session);
    //user g.user
}

machine.observe(v => {
    v.forEach((q) => {
        if (q.path.indexOf("user_on_request") >= 0) {
            //
            local_state.user_on_request = machine.state.user_on_request ? machine.state.user_on_request.user : "";
        }
        if (q.path.indexOf("session") >= 0) {
            //
            if (!local_state.session ||
                (machine.state.session && local_state.session.id != machine.state.session.id)
            ) {
                io.emit("report", {
                    session: false
                })
            }
        }
    });
})

local_state.observe(v => {
    v.forEach((q) => {
        if (q.path.indexOf("user_on_request") >= 0) {
            //
            if (local_state.user_on_request) {
                start_game();
            }
        }
    });
    // console.log('reporting', local_state)
    io.emit("report", local_state);
})

function check_game_over() {
    var ended = 0;
    console.log(local_state.session);
    if (local_state.session && !local_state.session.end) {
        if (local_state.session.countdown == 0) {
            // ended = 1;
        } 
        if (local_state.session.gameresult >= 0) {
            ended = 1;
        }
        if (ended) {
            local_state.session.end = Date.now();
        }
    }
}

function clean_up() {
    if (local_state.session && local_state.session.end > 0 && Date.now() - local_state.session.end > 500) {
        local_state.session = false;
    }
}

//check local_state
setInterval(() => {
    if (local_state.session && !local_state.session.end && local_state.session.countdown > 0) {
        // console.log(local_state.session.countdown)
        local_state.session.countdown--;
    }
    check_game_over();
    clean_up();
}, 1000);


//serial
const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty.SLAB_USBtoUART', {
    baudRate: 38400
})

var data_pack = []

var _prev_session_recorded = "";

function parse_data_buffer(buf) {
    console.log(buf);
    if (buf[0] != 0xaa) return;
    if (buf[buf.length - 1] != 0xdd) return;
    var len = buf[1];
    var index = buf[2];
    var cmd = buf[3];
    if (cmd == 0x33) {
        //good
        if (buf[4] == 7) {
            //ended

            _prev_session_recorded = local_state.session ? local_state.session.id : "false";
            console.log("GAME START");
            //record session
            //do nothing yet
        }
        if (buf[4] == 9) {
            //ended
            console.log("GAME END", buf[5]);
            if (local_state.session && _prev_session_recorded == local_state.session.id) {
                local_state.session.gameresult = buf[5];
            }
        }
    }
}

port.on('data', (buf) => {
    // console.log('raw', buf);
    for (var i = 0; i < buf.length; i++) {
        var cur = buf[i];
        if (cur == 0xaa) {
            data_pack = [];
        }
        data_pack.push(buf[i]);
        if (cur == 0xdd) {
            // console.log(new Buffer(data_pack));
            parse_data_buffer(data_pack);
            data_pack = [];
        }
    }
});

function build_command(cmd, host, data) {
    data = data || [];
    var len = 1 + 1 + data.length + 1;
    var index = host ? 0x01 : 0x70;
    var pack = [];
    pack.push(len);
    pack.push(index);
    pack.push(cmd);
    pack = pack.concat(data);
    // pack.push(chk);
    var chk = checksum(new Buffer(pack));
    pack.push(chk);

    pack.unshift(0xAA);
    pack.push(0xDD);

    pack = new Buffer(pack);
    return pack;
}

function checksum(pack) {
    var d = 0;
    for (var p = 0; p < pack.length; p++) {
        d = d ^ pack[p];
    }
    return d;
}

function send_cmd(buffer) {
    port.write(buffer);
    port.flush();
    console.log(buffer);
}

var ctrl_cmd = obs.from({});
var prev_cmd = {};
var ctrl_map = {
    left: 3,
    right: 4,
    up: 2,
    bottom: 1
};
var shot_map = {
    grab: 0
};

function sync_cmds() {
    for (var i in ctrl_map) {
        if (prev_cmd[i] != ctrl_cmd[i]) {
            prev_cmd[i] = ctrl_cmd[i];
            send_cmd(build_command(0x33, true, [ctrl_map[i], ctrl_cmd[i] ? 1 : 0]));
        }
    }
    if (ctrl_cmd.grab && !prev_cmd.grab) {
        send_cmd(build_command(0x33, true, [0x06, 0x01]));
    }
    prev_cmd.grab = ctrl_cmd.grab;
}

setInterval(sync_cmds, 500);
ctrl_cmd.observe(() => {
    console.log(JSON.stringify(ctrl_cmd));
    sync_cmds();
});
var ctrl_timeout = undefined;

function update_timeout() {
    clearTimeout(ctrl_timeout)
    ctrl_timeout = setTimeout(() => {
        for (var i in ctrl_cmd) {
            ctrl_cmd[i] = 0;
        }
    }, 1000);
}

io.on("ctrl", (ctrl) => {
    for (var i in ctrl) {
        ctrl_cmd[i] = ctrl[i];
    }
    update_timeout();
});

port.on("open", () => {
    console.log("serial port started");

    // ` 01 00 78 2f 05 28 00 03 00 00 01 3c 00 00 01 3c 00 04 04 04 3c`
    // ` 01 0f 00 20 00 04 05 00 05 00 01 3c 00 00 01 3c 00 04 04 04 3c`
    // send_cmd(greatSetting);
    //           03 0a 00 20 00 08 00 00 08 00 01 19 01 00 01 00 00 07 08 09 14
    // send_cmd(build_command(0x05, 0x01)); //query
    // send_cmd(cmd_factory_settings()); //query
    send_cmd(cmd_reset_coins()); //query
});

//AA 05 70 33 06 01 41 DD
//aa 05 70 33 01 01 46 dd
//hd ln id cm dt dt ck dd

const GAME_MODE_WEAK_FORCE = 0;
const GAME_MODE_STRONG_FORCE = 1;
const GAME_MODE_RANDOM_FORCE = 2;

function cmd_settings(
    game_mode,
    win_possibility_1_to_888,
    volt_strong_float_15_47p5,
    volt_weak_float_4p5_40,
    volt_transition_time_float_0p1_3,
    turn_weak_at_ceiling,
    cost_per_turn_int_1_to_20,
    game_time_int_5_to_60,
    bgm_on_off,
    speed_foward_back_int_1_to_10,
    speed_left_right_int_1_to_10,
    speed_up_down_int_1_to_10,
    speed_wire_len_int_10_to_90
) {
    var cfg = [];
    cfg.push(game_mode);
    cfg.push((win_possibility_1_to_888) & 0xff);
    cfg.push((win_possibility_1_to_888 >> 8) & 0xff);
    cfg.push(Math.floor(volt_strong_float_15_47p5));
    cfg.push(
        Math.floor((volt_strong_float_15_47p5 -
            Math.floor(volt_strong_float_15_47p5)) * 10)
    );
    cfg.push(Math.floor(volt_weak_float_4p5_40));
    cfg.push(
        Math.floor((volt_weak_float_4p5_40 -
            Math.floor(volt_weak_float_4p5_40)) * 10)
    );
    cfg.push(Math.floor(volt_transition_time_float_0p1_3));
    cfg.push(
        Math.floor((volt_transition_time_float_0p1_3 -
            Math.floor(volt_transition_time_float_0p1_3)) * 10)
    );
    cfg.push(turn_weak_at_ceiling ? 1 : 0);
    cfg.push(cost_per_turn_int_1_to_20);
    cfg.push(game_time_int_5_to_60);
    cfg.push(bgm_on_off ? 1 : 0);
    cfg.push(0);
    cfg.push(1);
    cfg.push(60);
    cfg.push(0);
    cfg.push(speed_foward_back_int_1_to_10);
    cfg.push(speed_left_right_int_1_to_10);
    cfg.push(speed_up_down_int_1_to_10);
    cfg.push(speed_wire_len_int_10_to_90);
    return build_command(0x06, 0x01, cfg);
}

function cmd_query_settings() {
    return build_command(0x05, 0x01)
}

function cmd_factory_settings() {
    return build_command(0x0B, 0x01)
}

function cmd_reset_coins() {
    return build_command(0x07, 0x01)
}

function cmd_add_coin(coin) {
    cmd_add_coin._cmd_id = cmd_add_coin._cmd_id || (Math.floor(Math.random() * 255));
    cmd_add_coin._cmd_id++;
    cmd_add_coin._cmd_id = cmd_add_coin._cmd_id % 255;
    var payload = [];
    payload.push(cmd_add_coin._cmd_id);
    payload.push(coin & 0xff);
    payload.push((coin >> 8) & 0xff);
    payload.push(coin & 0xff);
    payload.push((coin >> 8) & 0xff);
    return build_command(0x03, 0x01, payload);
}