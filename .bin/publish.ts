import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { getAddonPath, encryptLua, RPGConfig } from '@dotaddon/rigger'
import anyMatch from 'anymatch';
import { join } from "path";
import { walk } from "walk";
const { server } = getAddonPath()
const publish_options = RPGConfig().publish_options!
if (!publish_options)
    process.exit(1);

const walker = walk(server);
const excludeFiles = publish_options.excludeFiles;
const encryptFiles = publish_options.encryptFiles;
let mode = process.argv[2];
const dedicatedServerKey =
    mode == `release`
        ? publish_options.encryptDedicatedServerKey.publish
        : publish_options.encryptDedicatedServerKey.test

const dotaVer = publish_options.encryptDedicatedServerKey.key;

const getPublishPath = (source) => source.replace(server, server +"_pub");


let encryptCount = 0;
walker
    .on('file', (root, fileStats, next) => {
        const fileName = join(root, fileStats.name);
        if (anyMatch(excludeFiles, fileName)) {
            // ignore the files we dont want to publish
            console.log(`[publish.ts] ignore filtered file ->${fileName}`);
        } else {
            if (!existsSync(getPublishPath(root))) {
                mkdirSync(getPublishPath(root), { recursive: true });
                console.log(`[publish.ts] [create-path] ->${root}`);
            }
            if (anyMatch(encryptFiles, fileName)) {
                encryptLua(
                    fileName,
                    getPublishPath(fileName),
                    dedicatedServerKey,
                    dotaVer
                ).then(e=>{
                    encryptCount++;
                    console.log('\x1b[36m%s\x1b[0m', `[publish.ts] [encryptLua] ->${fileName}`);
                }).catch(err=>{
                    console.error("\x1b[31m", `[publish.ts] [encryptLua] ->${fileName}`, err);
                })
            } else {
                console.log(`[publish.ts] [copy] ->${getPublishPath(fileName) }`);
                copyFileSync(fileName, getPublishPath(fileName));
            }
            if (/addon_game_mode\.lua$/.test(fileName)) {
                const addonGameMode = readFileSync(getPublishPath(fileName), 'utf8');
                const timeStamp = new Date();
                // format to yyyy-mm-dd hh:mm
                const timeStampString = `${timeStamp.getFullYear()}-${
                    timeStamp.getMonth() + 1
                }-${timeStamp.getDate()} ${timeStamp.getHours()}:${timeStamp.getMinutes()}`;
                let newAddonGameMode = `_G.PUBLISH_TIMESTAMP = "${timeStampString}"\n\n` + addonGameMode;
                if (mode == `release_test`) {
                    newAddonGameMode = `_G.ONLINE_TEST_MODE = true\n\n` + newAddonGameMode;
                }
                writeFileSync(getPublishPath(fileName), newAddonGameMode);
            }
        }
        next();
    })
walker.on(`end`, () => {
        _stepC();
        console.log(
            `发布完成，发布模式是 ${
                mode == `release` ? `正式发布` : mode == `release_test` ? `在线测试` : `本地测试`
            }\n其中${encryptCount}个Lua文件使用 ${dedicatedServerKey} 加密!\n正在启动dota2，\n如果是测试发布请查看游戏运行是否正常！如果是正式发布请直接上传`
        );
    });


const fileName = "scripts/vscripts/addon_init.lua";

encryptLua(
    join(server, fileName),
    getPublishPath(join(server, fileName)),
    dedicatedServerKey,
    dotaVer
).then(e=>{
    _stepC()
})

let _cS = 0;
const MCS = 2;
function _stepC() {
    if (++_cS < MCS) return;

    console.log("\x1b[42m", "\x1b[37m", "Complete!!!!!!!!!!!!!!!!", "\x1b[0m");
    _versionAdd();
    _versionLog();
}

let _cVersion;
function _versionAdd() {
    function __readCode(path) {
        let code = readFileSync(path, "utf8");

        return parseInt(/(\w+)\s+=\s+(\d+)/.test(code) ? RegExp.$2 : "0");
    }

    const versionFileName = join(server, "scripts/vscripts/version.lua");
    const outVersionFileName = join(getPublishPath(server), "scripts/vscripts/version.lua");
    const buildVersionFileName = join(getPublishPath(server), "version.lua");

    let code;
    if (existsSync(buildVersionFileName)) {
        code = readFileSync(buildVersionFileName, "utf8");

        const codeNum = __readCode(buildVersionFileName) + 1;

        code = `${RegExp.$1} = ${codeNum};`;

        _cVersion = codeNum;
    } else {
        if (existsSync(versionFileName)) {
            const codeNum = __readCode(versionFileName) + 1;

            code = `${RegExp.$1} = ${codeNum};`;

            _cVersion = codeNum;
        } else {
            code = `BuildCode = 1;`;

            _cVersion = 1;
        }
    }

    writeFileSync(buildVersionFileName, code, { encoding: "utf8" });
    writeFileSync(outVersionFileName, code, { encoding: "utf8" });
}

function _versionLog() {
    const buildLogFileName = join(server, "versionBuild.log");

    const date = new Date(Date.now());

    const timeStr = date.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric", hour: "numeric", hour12: false, minute: "numeric", second: "numeric" });

    let oldLog = existsSync(buildLogFileName) ? readFileSync(buildLogFileName, "utf8") + "\n" : "";

    oldLog += `${_cVersion} ->>>>> Build Complete Time : ${timeStr}`;

    writeFileSync(buildLogFileName, oldLog, { encoding: "utf8" });
}
