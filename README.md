# watch-trigger

A simple utility script that associates file pattern lists with commands to run when a change in one of those files is detected. Uses simple file polling to maximize consistently across platforms (at the expense of some performance).

[![npm version](https://badge.fury.io/js/watch-trigger.svg)](https://badge.fury.io/js/watch-trigger)

## Usage

Create configuration file in your project. It describes the files to include in the watch set and the command to run when any of those files change:

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
  "include" : <glob pattern> OR [ <array of glob patterns> ],
  "exclude" : <glob pattern> OR [ <array of glob patterns> ],

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
  		"commands" : [ ... ],
    },
    ...
  ]
}
```

### Command string

The command string is passed directly to the shell for execution (using `child_process.execSync`), with one exception:

* The literal`$1` will be replaced with the filename of the file whose modification triggered the command

### `before` option

The `before` configuration option can be used to describe command(s) that are run exactly once before the watch starts. `watch-tigger` does *not* wait for these commands to finish before starting the watch.

For example, this would start the `dev-server` (and presumably leave it running) and re-run the `build-assets` target whenever an asset file changed *without* restarting the `dev-server`.

```
{
    "before" : "make dev-server --no-print-directory",
    "include" : "src/assets/**/*",
    "command" : "make build-assets --no-print-directory"
}
```
