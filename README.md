# watch-trigger

A simple utility script that associates file pattern lists with commands to run when a change in one of those files is detected. Uses simple file polling to maximize consistently across platforms (at the expense of some performance).

[![npm version](https://badge.fury.io/js/watch-trigger.svg)](https://badge.fury.io/js/watch-trigger)]

## Usage

Create configuration file in your project:

```json
{
    "include" : "src/**/*",
    "command" : "make build --no-print-directory"
}
```

Then run `watch-trigger` with that configuration file:

````bash
node node_modules/watch-trigger/index.js my-config.json
````

## Configuration

The configuration file can be written as either JSON or JavaScript. If it is written in JavaScript, the `module.exports` should be a JSON object.

### Single file set configuration

```
{
  "include" : <glob pattern> | [ <array of glob patterns> ],
  "exclude" : <glob pattern> | [ <array of glob patterns> ],

  "command" : <command string>,
  **OR**
  "commands": [ <array of sequential command strings> ],
}
```

### Multiple file set configuration

If multiple sets of glob patterns and commands are required, an array of sets can be used:

```
{
  "sets" : [
    {
  		"include" : ...,
  		"exclude" : ...,
  		"command" : ...,
    },
    {
  		"include" : ...,
  		"exclude" : ...,
  		"commands" : [ ... ],
    },
    ...
  ]
}
```

### Command string

The command string is passed directly to the shell for execution (using `child_process.execSync`), with one exception:

* The literal`$1` will be replaced with the filename of the file whose modification triggered the command
