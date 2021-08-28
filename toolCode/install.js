const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { getAddonName, getDotaPath, ProgressBar, getMapName } = require('./utils');

const pb = new ProgressBar('文件链接到dota2目录',5);
const linkPath = {
    content:{
        地图:'maps',
        贴图:'materials',
        模型:'models',
        特效:'particles',
    },
    game:{
        资源:'resource',
    }
};

const items = {
    信息:'addoninfo.txt',
    事件:'scripts/custom.gameevents',
    网表:'scripts/custom_net_tables.txt',
    人像:'scripts/npc/portraits_custom.txt',
    激活:'scripts/npc/herolist.txt',
    英雄:'scripts/npc/npc_heroes_custom.txt',
    单位:'scripts/npc/npc_units_custom.txt',
    物品:'scripts/npc/npc_items_custom.txt',
    中立:'scripts/npc/npc_neutral_items_custom.txt',
    技能:'scripts/npc/npc_abilities_custom.txt',
    覆盖:'scripts/npc/npc_abilities_override.txt',
    商店:'scripts/shops.txt',
    自建商店:`scripts/shops/${getMapName()}_shops.txt`,
}

function linkA2B(sourcePath,targetPath) {
    fs.moveSync(sourcePath, targetPath);
    fs.symlinkSync(targetPath, sourcePath, 'junction');
    return `已建立链接 ${sourcePath} <==> ${targetPath}`
}

function connect(sourcePath, targetPath) {
    if (!fs.existsSync(sourcePath))
        fs.mkdirSync(sourcePath);

    if (!fs.existsSync(targetPath)) 
        return linkA2B(sourcePath,targetPath)

    const isCorrect = fs.lstatSync(sourcePath).isSymbolicLink() && fs.realpathSync(sourcePath) === targetPath;
    if (isCorrect)
        return `跳过 '${sourcePath}' 因为它已经被链接`

    // 移除目标文件夹的所有内容，
    fs.chmodSync(targetPath, '0755');
    fs.rmdirSync(targetPath, { recursive: true, force: true })
    return `'${targetPath}' 已经链接到另一个目录，删除\n${linkA2B(sourcePath,targetPath)}`
}

(async () => {
    const dotaPath = await getDotaPath();
    if (dotaPath === undefined)
        return console.log('找不到Dota 2安装。 插件链接被跳过。');

    const tran = path.join(__dirname, '..', '编译')
    if (!fs.existsSync(tran)) fs.mkdirSync(tran);

    let index = 1;
    let addonDir;
    const longer = Object.keys({...linkPath.game,...linkPath.content,...items}).length
    for(const directoryName in linkPath){
        const targetRoot = path.join(dotaPath, directoryName, 'dota_addons');
        assert(fs.existsSync(targetRoot), `无法找到 '${targetRoot}'`);

        const addonPath = addonDir = path.join(targetRoot, getAddonName());
        if (!fs.existsSync(addonPath)) fs.mkdirSync(addonPath);

        connect(path.join(tran, directoryName), addonPath)
        const linkList = linkPath[directoryName];
        for(const curPath in linkList){
            const sourcePath = path.resolve(__dirname, '..', curPath);
            const targetPath = path.join(addonPath, linkList[curPath]);

            pb.render({
                completed: index++,
                total: longer,
                msg: connect(sourcePath, targetPath)
            });
        }
    }

    for (const item in items) {
        const sourcePath = path.resolve(__dirname, '..', '项目', 'item', `${item}.kv`);
        if (!fs.existsSync(sourcePath)) continue;
        const targetPath = path.join(addonDir, items[item]);
        const targetRoot = path.dirname(targetPath)
        if (!fs.existsSync(targetRoot)) fs.mkdirSync(targetRoot);

        pb.render({
            completed: index++,
            total: longer,
            msg: fs.copyFileSync(sourcePath, targetPath)// fs.writeFileSync(targetPath, fs.readFileSync(sourcePath))
        });
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
