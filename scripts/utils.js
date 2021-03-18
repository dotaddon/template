const { findSteamAppByName, SteamNotFoundError } = require('find-steam-app');
const packageJson = require('../package.json');
const fs = require('fs-extra');
const slog = require('single-line-log').stdout;//用以在同一行打印文本

module.exports.getAddonName = () => {
    if (!/^[a-z]([\d_a-z]+)?$/.test(packageJson.name)) {
        throw new Error('Addon name may consist only of lowercase characters, digits, and underscores ' + 'and should start with a letter. Edit `name` field in `package.json` file.');
    }

    return packageJson.name;
};

module.exports.getDotaPath = async () => {
    try {
        return await findSteamAppByName('dota 2 beta');
    } catch (error) {
        if (!(error instanceof SteamNotFoundError)) {
            throw error;
        }
    }
};

module.exports.getMapName = () => {
    if (!/^[a-z]([\d_a-z]+)?$/.test(packageJson.mainmap)) {
        return null
        // throw new Error('Addon name may consist only of lowercase characters, digits, and underscores ' + 'and should start with a letter. Edit `name` field in `package.json` file.');
    }

    return packageJson.mainmap;
};

read_all_files = (path) => {
    var pa = fs.readdirSync(path);
    var files = [];
    pa.forEach((ele, index) => {
        let child = path + '/' + ele;
        let info = fs.statSync(child);
        if (info.isDirectory()) {
            let subs = read_all_files(child);
            subs.forEach((s) => files.push(s));
        } else {
            files.push(child);
        }
    });
    return files;
};
module.exports.read_all_files = read_all_files;

read_sub_directories = (path) => {
    var pa = fs.readdirSync(path);
    var directories = [];
    pa.forEach((ele, index) => {
        let child = path + '/' + ele;
        let info = fs.statSync(child);
        if (info.isDirectory()) {
            directories.push(child);
        }
    });
    return directories;
};
module.exports.read_sub_directories = read_sub_directories;


// 封装的 ProgressBar 工具
function ProgressBar(description, bar_length){
    // 两个基本参数(属性)
    this.description = description || 'Progress';    // 命令行开头的文字信息
    this.length = bar_length || 25;           // 进度条的长度(单位：字符)，默认设为 25

    // 刷新进度条图案、文字的方法
    this.render = function (opts){
    var percent = (opts.completed / opts.total).toFixed(4);  // 计算进度(子任务的 完成数 除以 总数)
    var cell_num = Math.floor(percent * this.length);       // 计算需要多少个 █ 符号来拼凑图案

    // 拼接黑色条
    var cell = '';
    for (var i=0;i<cell_num;i++) {
        cell += '█';
    }

    // 拼接灰色条
    var empty = '';
    for (var i=0;i<this.length-cell_num;i++) {
        empty += '░';
    }

    // 拼接最终文本
    var cmdText = this.description + ': ' + (100*percent).toFixed(2) + '% ' + cell + empty + ' ' + opts.completed + '/' + opts.total;

    // 在单行输出文本
    slog(cmdText);
    };
}

module.exports.ProgressBar = ProgressBar;