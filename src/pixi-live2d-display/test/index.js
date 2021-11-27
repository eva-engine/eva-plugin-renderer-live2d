const { getData, setData } = require('./utils').remoteRequire('./local');
window.isHeadful = console.log.toString().includes('native code');

if (isHeadful) {
    if (!getData().initialized) {
        window.onbeforeunload = () => {
            setData({ initialized: true });
        };

        const { remote } = require('electron');
        remote.getCurrentWindow().maximize();

        // prefer devtools at right!
        const webContents = remote.getCurrentWebContents();
        webContents.closeDevTools();
        webContents.openDevTools({ mode: 'right' });
    }

    console.log(getData());
} else {
    // console.log = () => {};
}

const chai = require('chai');

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

global.expect = chai.expect;
global.sinon = require('sinon');

const { BASE_PATH, readText } = require('./utils');

const base = document.createElement('base');
base.href = BASE_PATH;
document.head.appendChild(base);

// using require() will let these files be bundled by Webpack, which slows down the process,
// so here's an alternative to load the script
eval(readText('../core/live2d.min.js'));
eval(readText('../core/live2dcubismcore.js')
    .replace('var Live2DCubismCore', 'window.Live2DCubismCore={}')
    .replace('(Live2DCubismCore) {', '(Live2DCubismCore) {Live2DCubismCore.em=()=>_em;'));

async function startUp() {
    await require('@/cubism4/setup').cubism4Ready();
    require('./env').setupENV();
}

before(function(done) {
    // wait for re-opened devtools to prepare network recording
    const timeout = !isHeadful || getData().initialized ? 0 : 300;

    setTimeout(() => startUp().then(done), timeout);
});

const { config } = require('@/config');

after(() => config.logLevel = config.LOG_LEVEL_VERBOSE);

// prevent Pixi from flagging WebGL as unsupported in headless test
// https://github.com/pixijs/pixi.js/issues/6109
require('@pixi/utils'); // let the property get initialized
require('@pixi/settings').settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

require('./module');
require('./browser');
