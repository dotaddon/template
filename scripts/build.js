const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const { getAddonName, getDotaPath, read_all_files, ProgressBar } = require('./utils');

/**
 * 不需要被编译的过滤
 */
const buildFilter = (file)=>{
    return !fs.existsSync(file)
    || file.indexOf('panorama/src')>0
    || file.indexOf('config')>0
}

/* 这里是模拟 DB 的单条写入更新的异步任务 */
function update() {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve();
        }, 1000);
    });
}

/* 单次任务，并行执行3条 */
async function singleTask(arr, win64, targetRoot) {
await Promise.all(
    arr.map(async (file) => {
    try {
        // console.log("正在处理", file);
        const args = [ '-f', '-i', file, '-outroot', targetRoot ];
        spawn(path.join(win64, 'resourcecompiler.exe'), args );
        // 这个 update 方法就是你的 userModel.findOrCreate 方法，你需要自己替换一下
        await update({
        //   where: _.pick(info, ["taskId", "challengeId", "uid"]),
        //   defaults: info,
        });
    } catch (error) {
        // error
    }
    })
);
}

(async () => {
    const dotaPath = await getDotaPath();
    const win64 = path.join(dotaPath, 'game', 'bin', 'win64');

    const sourceRoot = path.join( dotaPath, 'content', 'dota_addons');
    assert(fs.existsSync(sourceRoot), `无法找到目录 '${sourceRoot}'`);

    const sourcePath = path.join( sourceRoot , getAddonName());
    assert(fs.existsSync(sourcePath), `无法找到目录 '${sourcePath}' 请先执行 install`);

    const targetRoot = path.join( dotaPath, 'game');
    assert(fs.existsSync(targetRoot), `无法找到目录 '${targetRoot}'`);

    const files = read_all_files(sourcePath);
    const MAX_COUNT = 3;

    const userTasks = files
    .filter(ele=>!buildFilter(ele))
    .reduce(
      (acc, v) => {
        const lastArr = acc[acc.length - 1];
        if (lastArr.length < MAX_COUNT) {
          lastArr.push(v);
        } else {
          acc.push([v]);
        }
        return acc;
      },
      [[]]
    );

    // 初始化一个进度条长度为 25 的 ProgressBar 实例
    var pb = new ProgressBar('编译进度',25);
    let index = 1;
    for (const arr of userTasks) {
        // 更新进度条
        pb.render({ completed: index, total: userTasks.length });
        // console.log(`开始处理第${index}组:`);
        await singleTask(arr, win64, targetRoot);
        // console.log(`第${index}组:处理完毕`);
        index++;
    }

    const imagePath = path.join( sourcePath ,'panorama', 'images');
    if (!fs.existsSync(imagePath)) return;

    const images = read_all_files(imagePath);
    let styles = '#this_just_for_load_img_not_useful {\n';
    images.forEach(dir => {
        let parenti = dir.lastIndexOf('images');
        let out_dir = dir.substr( parenti+7, dir.length);
        styles += ` background-image:url("file://{images}/${out_dir}");\n`
    });
    styles += '}';

    const outpath = path.join( sourcePath ,'panorama', 'styles', 'async_customdata.css')
    let parenti = outpath.lastIndexOf('\\');
    let out_dir = outpath.substr(0, parenti);
    if (!fs.existsSync(out_dir)) fs.mkdirSync(out_dir);
    
    fs.writeFileSync(outpath, styles);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
