'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const glob = require('glob');
const _ = require('underscore');

const config = require(path.join(process.cwd(), process.argv[2]));
if (typeof config.include === 'string') {
    config.include = [ config.include ];
}
if (typeof config.exclude === 'string') {
    config.exclude = [ config.exclude ];
}

console.log('Scanning files...');
var includeList = [];
var excludeList = [];
_.each(config.include, (pattern) => {
    includeList = includeList.concat(glob.sync(pattern, { nodir : true }));
});
_.each(config.exclude, (pattern) => {
    excludeList = excludeList.concat(glob.sync(pattern, { nodir : true }));
});

var scanList = _.difference(includeList, excludeList);

console.log('Found '+scanList.length+' files...');
var byExt = _.groupBy(scanList, (file) => {
    return path.extname(file).substr(1);
});
_.each(byExt, function(list, ext) {
    console.log('  ' + list.length + ' ' + ext + ' files');
});

var doneList = [];
var horizon = Date.now();

function updateTimestamp(filename) {
    var now = fs.statSync(filename).mtime.valueOf();
    return (now > horizon);
}
function poll() {
    if (scanList.length === 0) {
        scanList = doneList;
        doneList = [];
    }
    var filename = scanList.shift();
    doneList.push(filename);

    if (updateTimestamp(filename)) {
        console.log('File modification detected: ' + filename);
        console.log(config.command);
        execSync(config.command, { stdio: 'inherit' });
        horizon = Date.now();
        setTimeout(poll, 200);
    } else {
        setTimeout(poll, 20);
    }
}

console.log('Starting file watch...');
poll();
