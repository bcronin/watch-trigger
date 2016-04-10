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
if (typeof config.commands === 'string') {
    config.commands = [ config.commands ];
}
config.commands = config.commands || [];
if (config.command) {
    config.commands.push(config.command);
}

var scanList = [];
var doneList = [];
var horizon = Date.now();

rescanFiles();
console.log('Starting file watch...');
poll();

function rescanFiles() {
    console.log('Scanning files...');
    _.each(config.include, (pattern) => {
        scanList = scanList.concat(glob.sync(pattern, {
            nodir : true,
            ignore : config.exclude,
        }));
    });
    doneList = [];

    console.log('Found '+scanList.length+' files...');
    var byExt = _.groupBy(scanList, (file) => {
        return path.extname(file).substr(1);
    });
    _.each(byExt, function(list, ext) {
        console.log('  ' + list.length + ' ' + ext + ' files');
    });
}

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

    if (!fs.existsSync(filename)) {
        rescanFiles();
        setTimeout(poll, 200);
    } else if (updateTimestamp(filename)) {
        console.log();
        console.log('[WATCH] File modification detected: ' + filename);
        _.each(config.commands, function (cmd) {

            // Replace $1 with the filename
            cmd = cmd.replace(/\$1/g, filename.replace(/^\.\//, ''));

            console.log('[WATCH] ' + cmd);
            console.log();
            try {
                execSync(cmd, { stdio: 'inherit' });
            } catch (_ignored) { /* ignored */  }
        })
        horizon = Date.now();
        setTimeout(poll, 200);
    } else {
        setTimeout(poll, 20);
    }
}
