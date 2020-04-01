var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(require('serve-static')(__dirname + "/front-end/dist"));
app.use(bodyParser.json());
console.log("UserLink @ 9797")
server.listen(9797);



