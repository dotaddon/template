const rimraf = require('rimraf');
const fs = require('fs-extra');
const path = require('path');

const { getDotaPath, getAddonName } = require('./utils');
(async () => {
    const publishSource = path.resolve(__dirname, '..', 'publish');
    const dotaPath = await getDotaPath();
    const publishTargetDirectory = path.join(dotaPath, 'game', 'dota_addons', getAddonName() + '_publish');

    if (fs.existsSync(publishSource)) rimraf.sync(publishSource);
    if (fs.existsSync(publishTargetDirectory)) rimraf.sync(publishTargetDirectory);

    console.log('删除了发布目录，重新制作以清理它');

    fs.mkdirSync(publishTargetDirectory);
    fs.symlinkSync(publishTargetDirectory, publishSource, 'junction');
    console.log('预发布完成，创建新的发布目录！');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
