import { getAddonPath, getMainMap } from '@dotaddon/rigger'
import { copyFile, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';

const items = {
    信息: 'addoninfo.txt',
    事件: 'scripts/custom.gameevents',
    网表: 'scripts/custom_net_tables.txt',
    人像: 'scripts/npc/portraits_custom.txt',
    激活: 'scripts/npc/herolist.txt',
    英雄: 'scripts/npc/npc_heroes_custom.txt',
    单位: 'scripts/npc/npc_units_custom.txt',
    物品: 'scripts/npc/npc_items_custom.txt',
    中立: 'scripts/npc/npc_neutral_items_custom.txt',
    技能: 'scripts/npc/npc_abilities_custom.txt',
    覆盖: 'scripts/npc/npc_abilities_override.txt',
    商店: 'scripts/shops.txt',
    自建商店: `scripts/shops/${getMainMap()}_shops.txt`,
}

const {server} = getAddonPath()

for (const item in items) {
    const sourcePath = resolve(__dirname, '..', '项目', 'item', `${item}.kv`);
    if (!existsSync(sourcePath)) continue;
    const targetPath = join(server, items[item]);
    const targetRoot = dirname(targetPath)
    if (!existsSync(targetRoot)) mkdirSync(targetRoot);

    copyFile(sourcePath, targetPath, () => console.info(`${item}复制完成,到${items[item]}`))
    // fs.writeFileSync(targetPath, fs.readFileSync(sourcePath))
}