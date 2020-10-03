cli
==========

For.io command line interface tool

[![Version](https://img.shields.io/npm/v/cli.svg)](https://npmjs.org/package/cli)
[![License](https://img.shields.io/npm/l/cli.svg)](https://github.com/nmihajlovski/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g for-io-cli
$ for.io COMMAND
running command...
$ for.io (-v|--version|version)
for-io-cli/0.0.1 linux-x64 node-v10.19.0
$ for.io --help [COMMAND]
USAGE
  $ for.io COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`for.io help [COMMAND]`](#forio-help-command)
* [`for.io listen TOKEN`](#forio-listen-token)

## `for.io help [COMMAND]`

display help for for.io

```
USAGE
  $ for.io help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `for.io listen TOKEN`

Listen for incoming connections from https://studio.for.io

```
USAGE
  $ for.io listen TOKEN

ARGUMENTS
  TOKEN  connection token, as provided by studio.for.io

OPTIONS
  -h, --help           show CLI help
  -m, --mongo=mongo    MongoDB connection url (default: mongodb://localhost:27017)
  -o, --origin=origin  allowed origin domain for CORS (default: https://studio.for.io)
  -p, --port=port      port to listen on (default: 3334)
  -t, --ttl=ttl        time-to-live, terminate after T seconds (default: unlimited)

EXAMPLE
  $ for.io listen kdf9035hd0
  $ for.io listen j94509fhg4 -p 3002
```

_See code: [src/commands/listen.ts](https://github.com/for-io/cli/blob/v0.0.1/src/commands/listen.ts)_
<!-- commandsstop -->
