const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const { getAddonName, getDotaPath } = require('./utils');

(async () => {
    const dotaPath = await getDotaPath();
    if (dotaPath === undefined) {
        console.log('找不到Dota 2安装。 插件链接被跳过。');
        return;
    }

    for (const directoryName of ['game', 'content']) {
        const sourcePath = path.resolve(__dirname, '..', directoryName);
        assert(fs.existsSync(sourcePath), `Could not find '${sourcePath}'`);

        const targetRoot = path.join(dotaPath, directoryName, 'dota_addons');
        assert(fs.existsSync(targetRoot), `Could not find '${targetRoot}'`);

        const targetPath = path.join(dotaPath, directoryName, 'dota_addons', getAddonName());
        if (fs.existsSync(targetPath)) {
            const isCorrect = fs.lstatSync(sourcePath).isSymbolicLink() && fs.realpathSync(sourcePath) === targetPath;
            if (isCorrect) {
                console.log(`跳过 '${sourcePath}' 因为它已经被链接`);
                continue;
            } else {
                // 移除目标文件夹的所有内容，
                console.log(`'${targetPath}' 已经链接到另一个目录，删除`);
                fs.chmodSync(targetPath, '0755');
                await rimraf(targetPath, () => {
                    console.log('删除目标路径');
                    fs.moveSync(sourcePath, targetPath);
                    fs.symlinkSync(targetPath, sourcePath, 'junction');
                    console.log(`已建立链接 ${sourcePath} <==> ${targetPath}`);
                });
            }
        } else {
            fs.moveSync(sourcePath, targetPath);
            fs.symlinkSync(targetPath, sourcePath, 'junction');
            console.log(`已建立链接 ${sourcePath} <==> ${targetPath}`);
        }
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
