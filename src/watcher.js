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
const chokidar = require('chokidar');
const crypto = require('crypto');
const path = require('path');
const synchronizer = require('./synchronizer');
const { shouldIgnore } = require('./ignoreutil');
const io = require('socket.io')({ serveClient: false });

const FS_CHANGE = 'fs-change';
const BROWSER_CHANGE = 'browser-change';

const MAX_SIZE = 256 * 1024;

// const debug = console.log.bind(console);
const debug = () => { };

function listenAndWatchDir({ workspaceDir, expectedToken, server, origin }) {
    let workspaceRoot = path.resolve(workspaceDir);

    function resolvePath(relName) {
        let absPath = path.resolve(relName);

        // make sure only the designated workspace dir is being synchronized
        if (!absPath.startsWith(workspaceRoot + path.sep)) {
            throw new Error(`The target path "${absPath}" doesn't belong in the workspace "${workspaceRoot}"!`);
        }

        return absPath;
    }

    io.on('connection', socket => {

        let watcher;
        let targetProjectName;

        socket.on('init-watch', ({ token, listenFS, projectName }) => {
            try {
                debug('INIT', { token, listenFS, projectName });

                if (expectedToken === token) {
                    if (listenFS) {
                        let projectDir = resolvePath(path.join(workspaceDir, projectName));
                        targetProjectName = projectName;
                        watcher = watchDir({ projectDir, projectName, socket, expectedToken });
                    }
                } else {
                    throw new Error('Received invalid token!');
                }

            } catch (e) {
                logError(e);
            }
        });

        socket.on(BROWSER_CHANGE, ({ change, token }) => {
            try {
                if (!watcher) {
                    throw new Error('Watcher was not properly initialized!');
                }

                if (expectedToken === token && targetProjectName === change.projectName) {
                    let filename = resolvePath(path.join(workspaceDir, change.projectName, change.name));
                    synchronizer.syncBrowserChange(filename, change, watcher);
                } else {
                    throw new Error('Received invalid token or invalid project name!');
                }

            } catch (e) {
                logError(e);
            }
        });

        socket.on('disconnect', () => {
            debug(`Client disconected.`);
        });

    });

    io.origins([originWithPort(origin)]);

    io.listen(server);
}

function originWithPort(origin) {
    if (/:\d+$/.test(origin)) {
        return origin;
    } else {
        if (origin.startsWith('https://')) {
            return origin + ':443';
        } else {
            return origin + ':80';
        }
    }
}

function watchDir({ projectDir, projectName, socket, expectedToken }) {
    if (!fs.existsSync(projectDir)) {
        console.info(`Project folder "${projectDir}" was not found, created it`);
        fs.mkdirsSync(projectDir);
    }

    console.info(`Watching and synchronizing project folder "${projectDir}" with the browser`);

    const watcher = chokidar.watch(projectDir, {
        ignored: shouldIgnore,
        persistent: true,
        alwaysStat: true,
        atomic: 100,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100
        },
    });

    // https://nodejs.org/api/fs.html#fs_class_fs_stats
    async function onFileAddedOrChanged(absFilename, stats) {
        try {
            let filename = trimProjectDir(absFilename);

            if (shouldIgnore(filename)) return;
            if (!stats) throw new Error('No file stats!');

            if (stats.size > MAX_SIZE) {
                console.warn(`File "${filename}" is too big to sync.`);
                return;
            }

            let content = await fs.readFile(absFilename, 'utf8');
            let fsTime = stats.mtimeMs;
            let fsHash = MD5(content);

            debug(`File ${filename} change, time: ${stats.mtimeMs}, md5: ${fsHash}`);

            let change = { kind: 'fs-file-changed', projectName, filename, content, fsTime, fsHash };
            socket.emit(FS_CHANGE, { change, 'token': expectedToken });

        } catch (e) {
            logError(e);
        }
    }

    async function onFileOrFolderRemoved(absFilename) {
        try {
            let filename = trimProjectDir(absFilename);

            if (shouldIgnore(filename)) return;

            let fsTime = new Date().getTime();

            debug(`File ${filename} removed, time: ${fsTime}`);

            let change = { kind: 'fs-file-or-folder-removed', projectName, filename, fsTime };
            socket.emit(FS_CHANGE, { change, 'token': expectedToken });

        } catch (e) {
            logError(e);
        }
    }

    function trimProjectDir(filename) {
        let prefix = projectDir + path.sep;

        if (filename.startsWith(prefix)) {
            filename = filename.substring(prefix.length);
            return filename;

        } else {
            throw new Error(`Expected the filename "${filename}" to start with the prefix "${prefix}"!`);
        }
    }

    watcher.on('add', onFileAddedOrChanged);
    watcher.on('change', onFileAddedOrChanged);
    watcher.on('unlink', onFileOrFolderRemoved)
    watcher.on('unlinkDir', onFileOrFolderRemoved)

    // watcher.on('addDir', async (path, stats) => {
    //     debug(`DIR ${path} added, time: ${stats.mtimeMs}`);
    // });

    // watcher.on('raw', async (event, name, details) => {
    //     log('Raw event', {event, name, details});
    // })

    watcher
        .on('error', error => debug(`Watcher error: ${error}`))
        .on('ready', () => debug('Initial scan complete, ready for changes.'));

    return watcher;
}

function MD5(s) {
    return crypto.createHash('md5').update(s, 'utf-8').digest('hex');
}

function logError(e) {
    console.warn(e + '');
}

module.exports = { listenAndWatchDir };