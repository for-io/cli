import { Command, flags } from '@oclif/command'

export default class Listen extends Command {

  static description = 'Listen for incoming connections from https://studio.for.io'

  static examples = [
    `$ for.io listen kdf9035hd0
$ for.io listen j94509fhg4 -p 3030
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    origin: flags.string({ char: 'o', description: 'allowed origin domain for CORS (default: https://studio.for.io)' }),
    mongo: flags.string({ char: 'm', description: 'MongoDB connection url (default: mongodb://localhost:27017)' }),
    port: flags.integer({ char: 'p', description: 'port to listen on (default: 3334)' }),
    ttl: flags.integer({ char: 't', description: 'time-to-live, terminate after T seconds (default: unlimited)' }),
    debug: flags.boolean({ char: 'd', description: 'enable debug mode (default: disabled)' }),
  }

  static args = [{ name: 'token', required: true, description: 'connection token, as provided by studio.for.io' }]

  async run() {
    const { args, flags } = this.parse(Listen)

    const token = args.token
    const origin = flags.origin ?? 'https://studio.for.io'
    const port = flags.port ?? 3334
    const mongoUrl = flags.mongo ?? 'mongodb://localhost:27017'
    const ttl = flags.ttl
    const debugMode = flags.debug ?? false

    const server = require('../server')
    await server.start({ token, origin, mongoUrl, port, ttl, debugMode })
  }

}
