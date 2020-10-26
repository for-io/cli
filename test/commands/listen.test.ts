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

import { expect, test } from '@oclif/test'

describe('listen', () => {
  test
    .stdout()
    .command(['listen', 'mytoken', '-t', '1'])
    .timeout(2000)
    .it('runs listen mytoken -t 1', ctx => {
      expect(ctx.stdout).to.contain('Waiting for the browser to connect from https://studio.for.io:443 to 127.0.0.1:3334')
    })

  test
    .stdout()
    .command(['listen', 'mytoken', '-p', '3030', '-t', '1'])
    .timeout(2000)
    .it('runs listen mytoken -p 3030 -t 1', ctx => {
      expect(ctx.stdout).to.contain('Waiting for the browser to connect from https://studio.for.io:443 to 127.0.0.1:3030')
    })
})
