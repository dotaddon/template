const fs = require('fs-extra');
const path = require('path');
const jskv = require('dota-js-kv');
const program = require('commander');
const chokidar = require('chokidar');
const { read_all_files, read_sub_directories } = require('./utils');

let npc_path = 'game/scripts/npc';
function kv_js_sync() {
    console.log('开始同步KV-JS文件');
    if (!fs.existsSync(npc_path)) {
        console.log('game/scripts/npc 目录不存在，请忽略kv同步！');
        return;
    }
    let files = read_all_files(npc_path);
    let out_put = '';
    files.forEach((file) => {
        let ext = path.extname(file);
        if (!(ext == '.txt' || ext == '.kv')) {
            console.log('kv-js同步脚本忽略无kv文件的更改=>', file);
            return;
        }
        let kv = jskv.decode(fs.readFileSync(file, 'utf-8'));
        let file_name = file.replace(/^.*[\\\/]/, '').replace(/\..*/, '');
        out_put += 'Game.' + file_name + ' = ' + JSON.stringify(kv) + '\n';
    });
    let content_path = 'content/panorama/scripts/';
    if (!fs.existsSync(content_path)) {
        console.log('不创建现有内容kv路径=>', content_path);
        fs.mkdirSync(content_path);
    }
    let output_path = content_path + 'async_customdata.js';
    fs.writeFileSync(output_path, out_put);
    console.log('写入', output_path, '完成');
}

(async () => {
    kv_js_sync();
    program.option('-w, --watch', 'Watch Mode').parse(process.argv);
    if (program.watch) {
        console.log('进入后台同步');
        chokidar.watch(npc_path).on('change', (event, path) => {
            kv_js_sync();
        });
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
