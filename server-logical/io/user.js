//misc
var TOKEN_COOKIE_KEY = 'EM_I_TOKEN';
var cookie = require('cookie');
var cors = require("cors");
var throttle = require("../lib/throttle");
var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(cors());

io.use(require('socket.io-cookie-parser')());
app.use("/models", require('serve-static')(process.cwd() + "/front-end/models"));
app.use(require('serve-static')(process.cwd() + "/front-end/dist"));
app.use(bodyParser.json());
app.use(require("cookie-parser")())
console.log("UserLink @ 9797")
server.listen(9797);

//30 * 1000min
//6000/month
//20000

var machines = require("../model/machine");
var rooms = require("../model/room");
var sessions = require("../model/session");
var users = require("../model/user");

var online_sockets = {};
io.use((socket, next) => {
    if (!socket.request.headers.cookie) return next(new Error("NO AUTH"));
    socket.cookies = cookie.parse(socket.request.headers.cookie);
    var token = socket.cookies[TOKEN_COOKIE_KEY];
    var user = users.get_current_user(token);
    if (!user) {
        return next(new Error("NO AUTH"))
        // return socket.disconnect(true);
    }
    if (online_sockets[user.uid]) {
        //disconnect old ladaayyyys
        try {
            online_sockets[user.uid].disconnect();
        } catch (E) {}
    }
    socket.user = user;
    socket.token = token;
    socket.userstate = users.states[user.uid];
    socket.userid = socket.user.uid;
    online_sockets[socket.user.uid] = socket;
    users.user_online(socket.user.uid);
    next();
});
io.on("connection", (socket) => {
    var uid = socket.user.uid;
    var user = socket.user;
    var token = socket.token;

    function check_auth() {
        if (!users.get_current_user(socket.token)) {
            //kill
            socket.disconnect();
            return false;
        }
        return true;
    }
    socket.on("disconnect", () => {
        if (online_sockets[socket.userid] == socket) {
            delete online_sockets[socket.userid];
            users.user_offline(socket.user.uid);
        }
        socket.removeAllListeners(); //done
    });
    socket.on("chat", (msg) => {
        //valid
        if (socket.userstate && socket.userstate.room_id && rooms.states[socket.userstate.room_id] && check_auth()) {
            rooms.sendChat(socket.userstate.room_id, {
                user: {
                    uid: socket.user.uid,
                    private: socket.user.private,
                    public: socket.user.public
                },
                chat: msg
            });
        }
    });
    socket.on("control", (cmd) => {
        if (check_auth()) {
            var sess = sessions.from_user(socket.userid);
            if (!sess) {
                return;
            }
            var machine = sess.machine;
            machines.send_command(machine, cmd);
        }
        //valid
    });

    function purge(data) {
        data = JSON.parse(JSON.stringify(data));
        for (var i in data) {
            delete data[i].private;
        }
        return data;
    }

    socket.emit("info", {
        machines: purge(machines.db.data),
        rooms: rooms.db.data
    });

    broadcast_room_states(socket);
    push_to_user(uid, "state", (users.states[uid]));
    push_to_user(uid, "user", sanitize_user_data(users.db.data[uid]));
    push_to_user(uid, "session", sessions.from_user(uid));
    //initialise all shit
});

//realtime casts
//hooking user & stuff
function push_to_user(uid, path, pack) {
    // online_sockets[uid];
    if (!online_sockets[uid]) {
        return;
    }
    try {
        online_sockets[uid].emit(path, pack);
        online_sockets[uid].emit("DEBUG", {
            path: path,
            pack: pack
        });
    } catch (e) {

    }
}

function sanitize_user_data(data) {
    data = JSON.parse(JSON.stringify(data));
    delete data.token;
    delete data.quiz_token;
    delete data.anwser;
    delete data.anwser_due;
    delete data.mobile;
    return data;
}

users.events.on("db", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var uid = v.path[0];
        !interest_party[uid] && push_to_user(uid, "user", sanitize_user_data(users.db.data[uid]));
        interest_party[uid] = true;
    });
});

users.events.on("states", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var uid = v.path[0];
        !interest_party[uid] && push_to_user(uid, "state", sanitize_user_data(users.states[uid]));
        interest_party[uid] = true;
    });
});

sessions.events.on("activesession", (changes) => {
    var interest_party = {};
    changes.forEach((v) => {
        var sess = v.path[0];
        //check on session
        var session = sessions.try_to_get_session(sess);
        if (!session) return;
        var session_state = sessions.session_status(sess);
        var uid = session.user;
        !interest_party[uid] && push_to_user(uid, "session",
            // session_state == sessions.ACTIVE ? session : {}
            session
        );
        interest_party[uid] = true;
    });
});

function broadcast_room_states(party) {
    //send to everyone
    //TODO: WARN this is very inefficient
    var room_info = {};
    for (var i in rooms.states) {
        room_info[i] = {
            users: rooms.states[i].users.length,
            session: rooms.states[i].session,
            user_on_request: rooms.states[i].user_on_request,
            machine_up: rooms.states[i].machine_up,
            machine_message: rooms.states[i].machine_message,
        };
    }
    // console.log(room_info, party);
    (party ? party : io).emit("room_states", room_info);
    (party ? party : io).emit("DEBUG", {
        "path": "room_states",
        pack: room_info
    });
}

rooms.events.on("states", (changes) => {
    //compile all room info & send down
    throttle(broadcast_room_states, 50, "BCAST_ROOM");
});

rooms.events.on("chat", (chat_pack) => {
    //chat delivery
    var room = chat_pack.room;

    if (!rooms.states[room]) return; //drop it
    //cast stuff to users in room
    rooms.states[room].users.forEach((v) => {
        push_to_user(v, "chat", chat_pack);
    });
});

app.get("/logout", (req, res) => {
    res.cookie(TOKEN_COOKIE_KEY, '', {
        maxAge: 10,
        httpOnly: true
    });
    res.clearCookie(TOKEN_COOKIE_KEY);
    return res.redirect("/");
});

app.post("/actions/stage1_login", (req, res) => {
    var q = req.body;
    if (!q || !q.phone) {
        return res.json({
            error: "Body error"
        }).end();
    }
    var token = users.login_quiz(q.phone);
    if (!token) {
        return res.json({
            error: "Format error"
        }).end();
    }
    res.json({
        result: "OK",
        token: token
    }).end();
});

app.post("/actions/logout", (req, res) => {
    res.cookie(TOKEN_COOKIE_KEY, '', {
        maxAge: 10,
        httpOnly: true
    });
    res.clearCookie(TOKEN_COOKIE_KEY);
    return res.json({
        result: "bye"
    }).end();
});

app.post("/actions/stage2_login", (req, res) => {
    //login?
    var q = req.body;
    if (!q || !q.token || !q.anwser) {
        return res.json({
            error: "Body error"
        }).end();
    }
    var result = users.login(q.token, q.anwser, req.header("user-agent"));
    if (!result) {
        return res.json({
            error: "Auth failed"
        }).end();
    }
    res.cookie(TOKEN_COOKIE_KEY, result, {
        maxAge: 60 * 60 * 1000 * 24,
        expires: new Date(Date.now() + 60 * 60 * 1000 * 24),
        httpOnly: true
    });
    return res.json({
        result: "OK"
    }).end();
});
//auth
app.use((req, res, next) => {
    var key = req.cookies[TOKEN_COOKIE_KEY];
    if (!key) {
        res.cookie(TOKEN_COOKIE_KEY, '', {
            maxAge: 10,
            expires: new Date(Date.now()),
            httpOnly: true
        });
        res.clearCookie(TOKEN_COOKIE_KEY);
        return res.json({
            error: "NO AUTH"
        }).end();
    }
    var user = users.get_current_user(key);
    if (!user) {
        res.cookie(TOKEN_COOKIE_KEY, '', {
            maxAge: 10,
            httpOnly: true
        });
        res.clearCookie(TOKEN_COOKIE_KEY);
        return res.json({
            error: "NO AUTH"
        }).end();
    } else {
        req.user = user;
        req.userstate = users.states[user.uid];
        next();
    }
});

app.post("/actions/is_logged_in", (req, res) => {
    res.json({
        result: "OK"
    }).end();
});

app.post("/actions/change_room/:room_id", (req, res) => {
    if (req.params.room_id.toString() == "0" && req.userstate) {
        req.userstate.room_id = false;
    } else {
        if (!req.params.room_id || !rooms.states[req.params.room_id] || !req.userstate) {
            return res.json({
                error: "ROOM ERROR"
            }).end();
        }
        req.userstate.room_id = req.params.room_id;
        return res.json({
            result: "OK"
        }).end();
    }
    return res.json({
        error: "Other error.."
    }).end();
});

app.post("/actions/add_coin", (req, res) => {
    setTimeout(() => {
        req.user.private.coin+=10;
    }, 5000)
    return res.json({
        result: "OK"
    }).end();
});

app.post("/actions/start_game/:machine_id", (req, res) => {
    var sess = sessions.request_new_session(req.user.uid, req.params.machine_id);
    console.log("Starting", sess);
    if (sess) {
        return res.json({
            result: "OK"
        }).end();
    } else {
        return res.json({
            error: "Error " + sess
        }).end();
    }
});