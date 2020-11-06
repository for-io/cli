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

const path = require('path');

const SYNC_EXTENSIONS = {
    '.js': true,
    '.ts': true,
    '.json': true,
    '.txt': true,
    '.md': true,
};

const ALLOWED_NAMES = {
    '.gitignore': true,
    '.for.io': true,
};

const IGNORED_NAMES = {
    'node_modules': true,
    'package-lock.json': true,
};

function shouldIgnore(filename) {
    if (filename.split(path.sep).filter(shouldIgnoreByName).length > 0) {
        return true;
    }

    let ext = path.extname(filename);
    let basename = path.basename(filename);

    if (ext) {
        return !SYNC_EXTENSIONS[ext] && !ALLOWED_NAMES[basename];
    } else {
        return false;
    }
}

function shouldIgnoreByName(name) {
    return IGNORED_NAMES[name] === true || (name.startsWith('.') && !ALLOWED_NAMES[name]);
}

module.exports = { shouldIgnore };