var machines = require("./machine");
var rooms = require("./room");
var sessions = require("./session");
var users = require("./user");

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
users.add_coin(10);


console.log("IO", perf.IO);