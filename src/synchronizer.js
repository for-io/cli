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

const fs = require('fs-extra');
const path = require('path');

function syncBrowserChange(filename, change, watcher) {
    switch (change.kind) {
        case 'browser-file-changed':
            writeToFile(filename, change.content, change.browserTime, watcher);
            break;

        case 'browser-file-or-folder-removed':
            deleteFileOrFolder(filename, change.browserTime);
            break;

        default:
            console.warn('Received a browser file system change of unknown kind: ' + change.kind);
            break;
    }
}

function writeToFile(filename, content, timestamp, watcher) {
    let shouldWrite = false;

    try {
        let stats = fs.statSync(filename);
        shouldWrite = stats.mtimeMs < timestamp;

    } catch (e) {
        // probably it doesn't exist (TODO improve this check)
        shouldWrite = true;
        watcher.add(filename);
    }

    if (shouldWrite) {
        let dirname = path.dirname(filename);
        fs.ensureDirSync(dirname);

        fs.writeFileSync(filename, content);
    }
}

function deleteFileOrFolder(name, timestamp) {
    let stats;

    try {
        stats = fs.statSync(name);
    } catch (e) {
        // probably it doesn't exist, do nothing (TODO improve this check)
        return;
    }

    if (stats.mtimeMs < timestamp) {
        fs.removeSync(name);
    }
}

module.exports = { syncBrowserChange };