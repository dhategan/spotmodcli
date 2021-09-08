spotmodcli
==========

Command line tool for Spotfire Mods

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/spotmodcli.svg)](https://npmjs.org/package/spotmodcli)
[![Downloads/week](https://img.shields.io/npm/dw/spotmodcli.svg)](https://npmjs.org/package/spotmodcli)
[![License](https://img.shields.io/npm/l/spotmodcli.svg)](https://github.com/dhategan/spotmodcli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g spotmodcli
$ spotmodcli COMMAND
running command...
$ spotmodcli (-v|--version|version)
spotmodcli/0.1.0 win32-x64 node-v16.8.0
$ spotmodcli --help [COMMAND]
USAGE
  $ spotmodcli COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g spotmodcli
$ spotmodcli COMMAND
running command...
$ spotmodcli (-v|--version|version)
spotmodcli/0.1.0 win32-x64 node-v16.7.0
$ spotmodcli --help [COMMAND]
USAGE
  $ spotmodcli COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g spotmodcli
$ spotmodcli COMMAND
running command...
$ spotmodcli (-v|--version|version)
spotmodcli/0.1.0 win32-x64 node-v16.7.0
$ spotmodcli --help [COMMAND]
USAGE
  $ spotmodcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`spotmodcli help [COMMAND]`](#spotmodcli-help-command)
* [`spotmodcli init`](#spotmodcli-init)
* [`spotmodcli update [PATH]`](#spotmodcli-update-path)

## `spotmodcli help [COMMAND]`

display help for spotmodcli

```
USAGE
  $ spotmodcli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `spotmodcli init`

Initialize a new Spotfire Mods project

```
USAGE
  $ spotmodcli init
```

_See code: [src/commands/init.ts](https://github.com/dhategan/spotmodcli/blob/v0.1.0/src/commands/init.ts)_

## `spotmodcli update [PATH]`

Update a Spotfire Mods project to another API version.

```
USAGE
  $ spotmodcli update [PATH]

DESCRIPTION
  Update a Spotfire Mods project to another API version.
     This will only update the API type defintions, the mod schema file, and the API version in the mod manifest file.
     After this it might be necesary to revise the mod source code so that it's aligned with the new api version.
```

_See code: [src/commands/update.ts](https://github.com/dhategan/spotmodcli/blob/v0.1.0/src/commands/update.ts)_
<!-- commandsstop -->
* [`spotmodcli help [COMMAND]`](#spotmodcli-help-command)
* [`spotmodcli init`](#spotmodcli-init)

## `spotmodcli help [COMMAND]`

display help for spotmodcli

```
USAGE
  $ spotmodcli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `spotmodcli init`

Initialize a new Spotfire Mods project

```
USAGE
  $ spotmodcli init
```

_See code: [src/commands/init.ts](https://github.com/dhategan/spotmodcli/blob/v0.1.0/src/commands/init.ts)_
<!-- commandsstop -->
* [`spotmodcli hello [FILE]`](#spotmodcli-hello-file)
* [`spotmodcli help [COMMAND]`](#spotmodcli-help-command)

## `spotmodcli hello [FILE]`

describe the command here

```
USAGE
  $ spotmodcli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ spotmodcli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/dhategan/spotmodcli/blob/v0.1.0/src/commands/hello.ts)_

## `spotmodcli help [COMMAND]`

display help for spotmodcli

```
USAGE
  $ spotmodcli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_
<!-- commandsstop -->
