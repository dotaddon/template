const fs = require('fs-extra');
const path = require('path');
const jskv = require('dota-js-kv');
const program = require('commander');
const chokidar = require('chokidar');
const { read_all_files, ProgressBar, kvImport } = require('./utils');

const pb = new ProgressBar('同步KV-JS文件',5);
const path_from = '代码/npc';
const path_goto = '交互/scripts/';
function kv_js_sync() {
    let files = read_all_files(path_from);
    let out_put = '';
    files.forEach((file,index) => {
        let ext = path.extname(file);
        if (!(ext == '.txt' || ext == '.kv'))
            return `kv-js同步脚本忽略无kv文件的更改=> ${file}`;

        let kv = jskv.decode(fs.readFileSync(file, 'utf-8'));
        let file_name = file.replace(/^.*[\\\/]/, '').replace(/\..*/, '');
        out_put += '\nGameUI.CustomUIConfig().' + file_name + ' = ' + JSON.stringify(kv[kvImport]);
        pb.render({
            completed: index,
            total: files.length-1
        });
    });
    let output_path = path_goto + 'async_customdata.js';
    fs.writeFileSync(output_path, out_put);
    pb.render({
        msg:`写入${output_path}完成`
    });
}

(async () => {
    if (!fs.existsSync(path_from)) 
        return console.log(`${path_from} 目录不存在，请忽略kv同步！`);
    if (!fs.existsSync(path_goto)) {
        console.log(`不创建现有内容kv路径=> ${path_goto}`);
        fs.mkdirSync(path_goto);
    }
    kv_js_sync();
    program.option('-w, --watch', 'Watch Mode').parse(process.argv);
    if (program.watch) {
        console.log('进入后台同步');
        chokidar.watch(path_from).on('change', (event, path) => {
            kv_js_sync();
        });
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
