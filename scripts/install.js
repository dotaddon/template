const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const { getAddonName, getDotaPath, ProgressBar } = require('./utils');

const pb = new ProgressBar('文件链接到dota2目录',5);
const linkPath = {
    game:{
        资源:'resource',
        代码:'scripts',
        'addoninfo.txt':'addoninfo.txt'
    },
    content:{
        地图:'maps',
        交互:'panorama',
        贴图:'materials',
        模型:'models',
        特效:'particles',
    }
};

function linkA2B(sourcePath,targetPath) {
    
    fs.moveSync(sourcePath, targetPath);
    fs.symlinkSync(targetPath, sourcePath, 'junction');
    return `已建立链接 ${sourcePath} <==> ${targetPath}`
}
async function connect(sourcePath, targetPath) {
    if (!fs.existsSync(sourcePath))
        fs.mkdirSync(sourcePath);

    if (!fs.existsSync(targetPath)) 
        return linkA2B(sourcePath,targetPath)
    
    if (sourcePath.indexOf('txt')>0)
        return fs.copySync(sourcePath,targetPath)

    const isCorrect = fs.lstatSync(sourcePath).isSymbolicLink() && fs.realpathSync(sourcePath) === targetPath;
    if (isCorrect)
        return `跳过 '${sourcePath}' 因为它已经被链接`

    // 移除目标文件夹的所有内容，
    fs.chmodSync(targetPath, '0755');
    await rimraf(targetPath, () => {
        return `'${targetPath}' 已经链接到另一个目录，删除\n${linkA2B(sourcePath,targetPath)}`
    });
}
(async () => {
    let index = 1;
    const dotaPath = await getDotaPath();
    if (dotaPath === undefined)
        return console.log('找不到Dota 2安装。 插件链接被跳过。');
        
    for(const directoryName in linkPath){
        const targetRoot = path.join(dotaPath, directoryName, 'dota_addons');
        assert(fs.existsSync(targetRoot), `无法找到 '${targetRoot}'`);

        const addonPath = path.join(targetRoot, getAddonName());
        if (!fs.existsSync(addonPath)) fs.mkdirSync(addonPath);

        const linkList = linkPath[directoryName];
        for(const curPath in linkList){
            const sourcePath = path.resolve(__dirname, '..', curPath);
            const targetPath = path.join(addonPath, linkList[curPath]);
            pb.render({
                completed: index++,
                total: 8,
                msg:await connect(sourcePath, targetPath)
            });
        }
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
