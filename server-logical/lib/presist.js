var observer = require('./observer');
var event = require('events').EventEmitter;
var PATH = __dirname + '/db/';
var THROTTLE = 100;
var fs = require('fs');
try {
    fs.mkdirSync(PATH);
} catch (e) {}

module.exports = function (name, default_val) {

    var self = {
        data: default_val || {},
        event: new event()
    };

    var file = PATH + name + ".json";

    var _throttle = 0;

    function throttle(work) {
        clearTimeout(_throttle);
        _throttle = setTimeout(work, THROTTLE);
    }

    function watch_obj() {
        if (self.data.observe) return;
        self.data = observer.Observable.from(self.data);
        self.data.observe(changes => {
            self.event.emit("observe", changes);
            throttle(write_to_file);
        });
    }

    //load once
    function load_from_file() {
        if (!fs.existsSync(file)) {
            write_to_file();
        } else {
            try {
                self.data = JSON.parse(fs.readFileSync(file).toString());
            } catch (e) {
                //read failed
            }
        }
        watch_obj();
    }

    function write_to_file() {
        var _data_string = JSON.stringify(self.data);
        try {
            if (fs.existsSync(file)) {
                if (fs.readFileSync(file).toString() != _data_string) {
                    fs.renameSync(file, file + ".bk");
                }
            }
        } catch (e) {
            //backup failed
        }
        try {
            fs.writeFileSync(file, _data_string);
        } catch (e) {
            //write failed
        }
    }

    load_from_file();
    return self;
}