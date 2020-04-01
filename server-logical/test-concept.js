var observer = require('./lib/observer');
var j = observer.Observable.from({});
j.test = [1,2,3];
j.q = null;
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
j.q = 3
j.test.splice(2,1);
j.q = 1;
j.q = null;

for(var i in j) {
    delete j[i]
}

console.log(j.observe ? JSON.stringify(j) : 0);

// var presist = require("./presist");

// var objTest = presist("test", {demo: {}});
// objTest.data.test = 2