import { expect, test } from '@oclif/test'

describe('listen', () => {
  test
    .stdout()
    .command(['listen', 'mytoken', '-t', '1'])
    .timeout(2000)
    .it('runs listen mytoken -t 1', ctx => {
      expect(ctx.stdout).to.contain('Waiting for the browser to connect from https://studio.for.io to 127.0.0.1:3334')
    })

  test
    .stdout()
    .command(['listen', 'mytoken', '-p', '3030', '-t', '1'])
    .timeout(2000)
    .it('runs listen mytoken -p 3030 -t 1', ctx => {
      expect(ctx.stdout).to.contain('Waiting for the browser to connect from https://studio.for.io to 127.0.0.1:3030')
    })
})
