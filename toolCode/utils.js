const { getGamePath } = require('steam-game-path');
const packageJson = require('../package.json');
const fs = require('fs-extra');

// 这里用到一个很实用的 npm 模块，用以在同一行打印文本
const slog = require('single-line-log').stdout;

module.exports.getAddonName = () => {
    if (!/^[a-z]([\d_a-z]+)?$/.test(packageJson.name)) {
        throw new Error('Addon name may consist only of lowercase characters, digits, and underscores ' + 'and should start with a letter. Edit `name` field in `package.json` file.');
    }

    return packageJson.name;
};

module.exports.getDotaPath = async () => {
    return getGamePath(570).game.path;
};

module.exports.getMapName = () => {
    if (!/^([\d_a-z]+)?$/.test(packageJson.mainmap)) {
        return null
        // throw new Error('Addon name may consist only of lowercase characters, digits, and underscores ' + 'and should start with a letter. Edit `name` field in `package.json` file.');
    }

    return packageJson.mainmap;
};

/** 读取全部文件 */
read_all_files = path => {
    var files  = [];
    let active = (a)=>a.isDirectory()
        ? (b,c)=>b.push.apply(b, read_all_files(c) )
        : (b,c)=>b.push(c);
    fs.readdirSync(path)
      .forEach( ele => {
        let child = path + '/' + ele;
        active(fs.statSync(child))( files, child)
    });
    return files;
};
module.exports.read_all_files = read_all_files;

/** 读取文件目录 */
module.exports.read_sub_directories = path => {
    var directories = [];
    fs.readdirSync(path).forEach(ele => {
        let child = path + '/' + ele;
        let info = fs.statSync(child);
        if (info.isDirectory()) {
            directories.push(child);
        }
    });
    return directories;
};

/** 封装的 ProgressBar 工具 */
module.exports.ProgressBar = function (description, bar_length){
    // 两个基本参数(属性)
    this.description = description || 'Progress';    // 命令行开头的文字信息
    this.length = bar_length || 25;           // 进度条的长度(单位：字符)，默认设为 25
    this.error = ''
    /**
     * 刷新进度条图案、文字的方法
     * @param {*} opts completed 已完成
     * @param {*} opts total 总数
     * @param {*} opts msg 单次提交信息
     * @param {*} opts err 累计提交信息
     */
    this.render =opts=>{
    var percent = (opts.completed / opts.total).toFixed(4);  // 计算进度(子任务的 完成数 除以 总数)
    var cell_num = Math.floor(percent * this.length);       // 计算需要多少个 █ 符号来拼凑图案

    // 拼接黑色条
    var cell = '';
    for (var i=0;i<this.length;i++) {
    cell += i<cell_num ? '█' : '░';
    }
    this.error += opts.err? `\n${opts.err}`:'';
    // 拼接最终文本
    var cmdText = `${this.description}: ${(100*percent).toFixed(1)}% ${cell} ${opts.completed}/${opts.total}\n${opts.msg||''}\n${this.error}`;
    // 在单行输出文本
    slog(cmdText);
    };
};

module.exports.truePath = paths => {
    let result = '';
    paths.forEach(
        ele=>{
            result += ele
            if (!fs.existsSync(result)) fs.mkdirSync(result);
            result += '/'
        }
    )
    return result

}

module.exports.kvImport = "西索酱's excels tool";