const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { getAddonName, getDotaPath, read_all_files, ProgressBar, truePath } = require('./utils');

/** UI图片编译 */
function images_compiler(sourcePath) {
    const imagePath = path.join( sourcePath ,'panorama', 'images');
    let styles = '#this_just_for_load_img_not_useful {\n';
    if (fs.existsSync(imagePath)) {
        const images = read_all_files(imagePath);
        const pb = new ProgressBar('UI编译',25);
        images.forEach((dir,index) => {
            let parenti = dir.lastIndexOf('images');
            let out_dir = dir.substr( parenti+7, dir.length);
            styles += ` background-image:url("file://{images}/${out_dir}");\n`;
            pb.render({ completed: index, total: images.length-1 });
        });
    }
    styles += '}';
    let outpath = truePath([sourcePath,'panorama', 'styles', 'custom_game'])
    fs.writeFileSync(outpath+ 'async_customdata.css', styles);
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
    images_compiler(sourcePath)
    
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
