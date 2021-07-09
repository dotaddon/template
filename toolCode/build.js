const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { getAddonName, getDotaPath, read_all_files, ProgressBar, truePath } = require('./utils');

const buildFilter = (file)=>{
    return !fs.existsSync(file)
}

/** 编译 地图 模型 特效等资源 */
async function content_compiler(sourcePath, dotaPath ) {
    const targetRoot = path.join( dotaPath, 'game');
    assert(fs.existsSync(targetRoot), `无法找到目录 '${targetRoot}'`);

    const win64 = path.join(dotaPath, 'game', 'bin', 'win64');
    const files = read_all_files(sourcePath);
    const userTasks = files.filter(ele=>!buildFilter(ele))
    const compiler  = path.join(win64, 'resourcecompiler.exe')

    let pb = new ProgressBar('资源编译',25);
    let index = 0;
    function singleTask() {
        const filePath = userTasks[index]
        if(!fs.existsSync(filePath)) return;
        index++;
        pb.render({ completed: index, total: userTasks.length })
        let arg = [ '-f', '-i', filePath, '-outroot', targetRoot ];
        let cmd = spawn(compiler, arg)
        cmd.on('close', singleTask);
    }
    singleTask()
}

(async () => {
    const dotaPath = await getDotaPath();
    let sourcePath = path.join(dotaPath);
    [ 'content', 'dota_addons', getAddonName()].forEach(
        ele=>{
            sourcePath = path.join(sourcePath, ele)
            assert(fs.existsSync(sourcePath), `无法找到目录 '${sourcePath}' 请先执行 install`);
        }
    )
    content_compiler(sourcePath, dotaPath)
    
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
