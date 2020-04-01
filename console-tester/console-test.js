const SerialPort = require('serialport')
const port = new SerialPort('/dev/tty.SLAB_USBtoUART', {
    baudRate: 38400
})

var data_pack = []

function parse_data_buffer(buf) {
    if (buf[0] != 0xaa) return;
    if (buf[buf.length - 1] != 0xdd) return;
    var len = buf[1];
    var index = buf[2];
    var cmd = buf[3];
    if (cmd == 0x33) {
        //good
        if (buf[4] == 7) {
            //ended
            console.log("GAME START");
        }
        if (buf[4] == 9) {
            //ended
            console.log("GAME END", buf[5]);
        }
    }
}

port.on('data', (buf) => {
    for (var i = 0; i < buf.length; i++) {
        var cur = buf[i];
        if (cur == 0xaa) {
            data_pack = [];
        }
        data_pack.push(buf[i]);
        if (cur == 0xdd) {
            console.log(new Buffer(data_pack));
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

const readline = require('readline');

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

var mvCtl = {
    w: 0,
    a: 0,
    s: 0,
    d: 0
}
var states = {
    w: 0,
    a: 0,
    s: 0,
    d: 0
}
var mvMap = {
    w: 2,
    a: 3,
    s: 1,
    d: 4
}

setInterval(function () {
    for (var i in mvCtl) {
        var prevState = states[i];
        mvCtl[i]--;
        mvCtl[i] = Math.max(0, mvCtl[i]);
        mvCtl[i] = Math.min(8, mvCtl[i]);
        var curState = mvCtl[i] > 0;
        if (curState != prevState) {
            states[i] = curState;
            send_cmd(build_command(0x33, true, [mvMap[i], curState ? 1 : 0]));
        }
    }
}, 100);

process.stdin.on('keypress', (str, key) => {
    if (key.sequence == 'k') {
        process.exit();
    }
    if (key.sequence == 'w') {
        mvCtl.w++;
        // send_cmd(build_command(0x33, true, [0x01, 0x01]));
    }
    if (key.sequence == 'a') {
        mvCtl.a++;
        // send_cmd(build_command(0x33, true, [0x01, 0x01]));
    }
    if (key.sequence == 's') {
        mvCtl.s++;
        // send_cmd(build_command(0x33, true, [0x01, 0x01]));
    }
    if (key.sequence == 'd') {
        mvCtl.d++;
        // send_cmd(build_command(0x33, true, [0x01, 0x01]));
    }
    if (key.sequence == 'b') {
        send_cmd(build_command(0x33, true, [0x06, 0x01]));
    }
    if (key.sequence == 'c') {
        send_cmd(build_command(0x33, true, [0x06, 0x00]));
    }
    if (key.sequence == 'p') {
        send_cmd(cmd_add_coin(1)); //query
    }
})

port.on("open", () => {
    console.log("started");
    // send_cmd(build_command(0x33, true, [0x01, 0x01]));
    var greatSetting = cmd_settings(3,
        888,
        47.5,
        40,
        3,
        false,
        1,
        60,
        false,
        4,
        4,
        4,
        0x14);


    // ` 01 00 78 2f 05 28 00 03 00 00 01 3c 00 00 01 3c 00 04 04 04 3c`
    // ` 01 0f 00 20 00 04 05 00 05 00 01 3c 00 00 01 3c 00 04 04 04 3c`
    // send_cmd(greatSetting);
    //           03 0a 00 20 00 08 00 00 08 00 01 19 01 00 01 00 00 07 08 09 14
    // send_cmd(build_command(0x05, 0x01)); //query
    // send_cmd(cmd_factory_settings()); //query
    // send_cmd(cmd_reset_coins()); //query
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