/*!
 * for-io-cli
 *
 * Copyright (c) 2020 Nikolche Mihajlovski
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Command, flags } from '@oclif/command'

export default class Listen extends Command {

  static description = 'Listen for incoming connections from the web browser (https://studio.for.io), to run MongoDB queries and sync project files'

  static examples = [
    `$ for.io listen kdf9035hd0 my-workspace
$ for.io listen j94509fhg4 my-workspace -p 3030
`,
  ]

  static args = [
    { name: 'token', required: true, description: 'connection token, as provided by studio.for.io' },
    { name: 'workspace', required: false, description: 'local workspace directory to synchronize with the browser' },
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    origin: flags.string({ char: 'o', description: 'allowed origin domain for CORS (default: https://studio.for.io)' }),
    mongo: flags.string({ char: 'm', description: 'MongoDB connection url (default: mongodb://localhost:27017)' }),
    port: flags.integer({ char: 'p', description: 'port to listen on (default: 3334)' }),
    ttl: flags.integer({ char: 't', description: 'time-to-live, terminate after T seconds (default: unlimited)' }),
    debug: flags.boolean({ char: 'd', description: 'enable debug mode (default: disabled)' }),
  }

  async run() {
    const { args, flags } = this.parse(Listen)

    const token = args.token
    const workspace = args.workspace

    const origin = flags.origin ?? 'https://studio.for.io:443'
    const port = flags.port ?? 3334
    const mongoUrl = flags.mongo ?? 'mongodb://localhost:27017'
    const ttl = flags.ttl
    const debugMode = flags.debug ?? false

    const server = require('../server')
    await server.start({ token, origin, mongoUrl, port, ttl, debugMode, workspace })
  }

}
