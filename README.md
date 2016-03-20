# watch-trigger

A very simple utility script that reads a list of files to watch from a config file and runs a command whenever any of the files change.  Uses simple file polling in order to behave consistently across platforms.

```
{
    "command" : "make build --no-print-directory",
    "pattern" : "**/*",
    "ignore" : [
        "**/node_modules/**"
    ]
}
```
