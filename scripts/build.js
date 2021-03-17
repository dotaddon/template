const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { getAddonName, getDotaPath } = require('./utils');

// 不需要编译的规则
const needResource = (file)=>{
    return false
}

(async () => {
    const dotaPath = await getDotaPath();
    const win64 = path.join(dotaPath, 'game', 'bin', 'win64');

    const sourceRoot = path.join( dotaPath, 'content', 'dota_addons');
    assert(fs.existsSync(sourceRoot), `无法找到目录 '${sourceRoot}'`);

    const sourcePath = path.join( sourceRoot , getAddonName());
    assert(fs.existsSync(sourcePath), `无法找到目录 '${sourcePath}' 请先执行 install`);

    const targetPath = path.join( dotaPath, 'game');
    assert(fs.existsSync(targetPath), `无法找到目录 '${targetPath}'`);

    const files = read_all_files(sourcePath);

    files.forEach((file) => {
        if( needResource(file) ) return;

        const args = ['-i', file, '-outroot', targetPath ];
        spawn(path.join(win64, 'resourcecompiler.exe'), args );
    });

})().catch((error) => {
    console.error(error);
    process.exit(1);
});
