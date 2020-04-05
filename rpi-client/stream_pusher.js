var child_process = require("child_process");

var streams = [];
function start_worker(stream) {
    if(streams.indexOf(stream) != -1) {
        return;
    }
    streams.push(stream);
    child_process.exec("sh " + process.cwd() + "/ffmpeg-osx-push.sh " + stream);
}

module.exports.start_worker = start_worker;