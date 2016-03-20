'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const glob = require('glob');

const config = require(path.join(process.cwd(), process.argv[2]));
config.ignore = config.ignore || [];

console.log('Scanning files...');
var scanList = glob.sync(config.pattern, {
    nodir : true,
    ignore : config.ignore,
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

console.log('Starting file watch (' + scanList.length + ' files)...');
poll();
