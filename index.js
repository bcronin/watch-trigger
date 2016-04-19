'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const glob = require('glob');
const _ = require('underscore');

var config = require(path.join(process.cwd(), process.argv[2]));
if (!config.sets) {
    config = { sets : [ config ] };
}

_.each(config.sets, (set) => {
    if (typeof set.include === 'string') {
        set.include = [ set.include ];
    }
    if (typeof set.exclude === 'string') {
        set.exclude = [ set.exclude ];
    }
    if (typeof set.commands === 'string') {
        set.commands = [ set.commands ];
    }
    set.commands = set.commands || [];
    if (set.command) {
        set.commands.push(set.command);
    }
    set.root = set.root || process.cwd();
});

var commands = {};
var scanList = [];
var doneList = [];
var horizon = Date.now();

rescanFiles();
console.log('Starting file watch...');
poll();

function rescanFiles() {
    console.log('Scanning files...');
    _.each(config.sets, (set) => {
        _.each(set.include, (pattern) => {
            var list = glob.sync(pattern, {
                nodir : true,
                ignore : set.exclude,
            });
            _.each(list, (file) => {
                commands[file] = commands[file] || [];
                commands[file].push([ set.commands, set.root ]);
            });
        });
    });
    scanList = _.keys(commands);
    doneList = [];

    console.log('Found '+scanList.length+' files...');
    var byExt = _.groupBy(scanList, (file) => {
        return path.extname(file).substr(1);
    });
    _.each(byExt, function(list, ext) {
        console.log('  ' + list.length + ' ' + ext + ' files');
    });

    fs.writeFileSync("watch-trigger.status.json", JSON.stringify({
        commands : commands,
    }, null, 4));
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
        _.each(commands[filename], function (group) {

            _.each(group[0], function (cmd) {
                // Replace $1 with the filename
                var base = filename.replace(/^\.\//, '');
                var rel = path.relative(group[1], base).replace(/\\/g, "/");
                cmd = cmd.replace(/\$1/g, base).replace(/\$2/g, rel);
                console.log('[WATCH] ' + cmd);
                console.log();
                try {
                    execSync(cmd, { stdio: 'inherit' });
                } catch (_ignored) { /* ignored */  }
            });
        });
        horizon = Date.now();
        setTimeout(poll, 200);
    } else {
        setTimeout(poll, 20);
    }
}
