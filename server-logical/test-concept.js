var observer = require('./lib/observer');
var j = observer.Observable.from({});

j.observe(changes => {
    changes.forEach(change => {
        console.log(change);
    });
});
var sample = {
    type: 'insert',
    path: ['test', 'asdf'],
    value: 1,
    oldValue: undefined,
    object: {
        asdf: 1
    }
};
j.test = {};
j.test.asdf = 1;
j.test.asdf = 3;
j.test.asdf = 3;

console.log(j.observe ? JSON.stringify(j) : 0);

// var presist = require("./presist");

// var objTest = presist("test", {demo: {}});
// objTest.data.test = 2