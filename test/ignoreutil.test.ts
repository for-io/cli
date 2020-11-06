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

const assert = require('assert');

const { shouldIgnore } = require('../src/ignoreutil');

describe('ignore files', () => {

  it('should ignore node_modules', () => {
    assertIgnored([
      '/a/b/c/node_modules',
      '/a/b/c/node_modules/a',
      '/a/b/c/node_modules/a.js',
      '/a/b/c/node_modules/.gitignore',
    ], true);
  });

  it('should ignore package-lock.json', () => {
    assertIgnored([
      '/a/b/c/package-lock.json',
    ], true);
  });

  it('should ignore files and dirs starting with dot', () => {
    assertIgnored([
      '/a/b/c/.foo',
      '/a/b/c/.bar/x.js',
      '/a/b/c/.github',
      '/a/b/c/.nyc_output/a/b.js',
    ], true);
  });

  it('should not ignore .gitignore', () => {
    assertIgnored([
      '/a/b/c/.gitignore',
    ], false);
  });

  it('should not ignore .for.io', () => {
    assertIgnored([
      '/abc/myproject/.for.io',
      '/abc/myproject/.for.io/a.json',
      '/abc/myproject/.for.io/b.js',
    ], false);
  });

  for (const ext of ['js', 'ts', 'json', 'txt', 'md']) {
    it(`should not ignore .${ext} files`, () => {
      assertIgnored([
        `/abc/myproject/a.${ext}`,
        `/abc/myproject/a.b.${ext}`,
        `/abc/myproject/app.setup.${ext}`,
      ], false);
    });
  }

  for (const ext of ['gif', 'jpg', 'io', 'css', 'html']) {
    it(`should ignore .${ext} files`, () => {
      assertIgnored([
        `/abc/myproject/a.${ext}`,
        `/abc/myproject/a.b.${ext}`,
      ], true);
    });
  }

});

function assertIgnored(filenames: string[], areIgnored: boolean) {
  for (const filename of filenames) {
    assert.equal(shouldIgnore(filename), areIgnored);
  }
}