const fs = require('fs-extra');
const path = require('path');
const xlsx = require('node-xlsx');
const jskv = require('dota-js-kv');
const program = require('commander');
const chokidar = require('chokidar');
const { read_all_files, ProgressBar, kvImport } = require('./utils');
const transform = require('./transform')

const pb = new ProgressBar('excel 2 kv 编译器',5);
const vertical_key = [
    'vertical_keys',
    'localize',
    'tooltip',
]
const path_excel ={
    数据:'数据',
    方言:'资源',
}
const excel_keyname = 1; // 第二行存键名
let locali_data = {};
let declaration = {};

const depth  = n=> {
    let str = '';
    let index = 0
    do {
        str += '  ';
        index++;
    } while (index<=n);
    return str;
}


function excel_key_in_column(rowval, sheetName) {
    let key_row = rowval[excel_keyname];
    let kv_data = {};
    let key_in_column = transform[sheetName] || transform.default;

    for (i = excel_keyname+1; i < rowval.length; ++i) {
        let row_data = rowval[i];
        let main_key = row_data[0];
        if (main_key == null) continue;
        let ret_val = key_in_column( row_data,key_row );
        kv_data[main_key] = ret_val;
    }

    return kv_data;
}

function excel_key_in_row(rowval) {
    let key_row = rowval[excel_keyname];
    let kv_data = {};

    for (let j = 1; j < key_row.length; j++) {
        if(!key_row[j]) continue;
        let v_data = {}
        
        for (i = excel_keyname+1; i < rowval.length; ++i) {
            let row_data = rowval[i];
            let main_key = row_data[0];
            if (main_key == null) continue;
            let ret_val = row_data[j];
            if (ret_val == null) continue;
            v_data[main_key] = ret_val.toString();
        }
        
        if(key_row.length<=2) kv_data = v_data; else
        if(!kv_data[key_row[j]] ) kv_data[key_row[j]] = v_data;
    }
    return kv_data;
}

const save_lang_kv = async (dir) => {
    let index = 1
    for (const language in locali_data) {
        let file_name = path.join(dir,`addon_${language.toLowerCase()}.txt`);
        fs.writeFileSync(file_name, `"${kvImport}" ${jskv.encode(locali_data[language])}`);
        pb.render({ 
            total: index,
            completed: index++,
            msg:`写入语言文件完成 => ${file_name}`
        })
    }
}

const save_npc_declaration = async (file_name, keys) => {
    if( declaration[file_name] == keys)
        return;

    declaration[file_name.replace('数据\\','')] = keys;
    const path_into = '交互/declaration/async_customdata.d.ts';
    let str = 'declare interface CustomUIConfig {\n';
    let dp = 0;
    for(const name in declaration){
        str += `${depth(dp)}${name}:{\n`;
        dp ++;
        str += `${depth(dp)}[id:string]:{\n`;
        dp ++;
        declaration[name].forEach(
            ele => {
                ele = ele.toString();
                if(ele.indexOf('[{]') >= 0){
                    str += `${depth(dp)}${ele.replace('[{]','')}:{\n`;
                    dp++;
                }else if(ele.indexOf('[}]') >= 0){
                    dp--;
                    str += `${depth(dp)}},\n`;
                }else{
                    str += `${depth(dp)}${ele}:string,\n`
                }
            }
        )
        dp --;
        str += `${depth(dp)}},\n`;
        dp --;
        str += `${depth(dp)}},\n`;
    }
    str +='}';
    fs.writeFileSync(path_into, str);
}

function single_excel_filter(file, bNpc, path_from, path_goto) {
    let extName = path.extname(file)
    if ( ( extName!= '.xlsx' && extName != '.xls') || file.indexOf('~$') >= 0 )
        return `忽略非Excel文件=> ${file}`;

    let sheets = xlsx.parse(file);
    let sheet  = sheets[0];
    let rowval = sheet.data;
    if (rowval.length < excel_keyname+2)
        return `忽略空白文件=>${file}\n  至少需要${excel_keyname+2}行（注释，关键数据）`;

    let kv_data = vertical_key.indexOf(sheet.name )<0 ? excel_key_in_column(rowval,sheet.name) : excel_key_in_row(rowval);
    let datasum = Object.keys(kv_data).length;
    if (datasum <= 0)
        return `忽略异常文件=>${file}\n  实际数据长度只有${datasum}`;

    if(bNpc){
        let file_path = path.dirname(file).replace(path_from, path_goto)
        let file_name = path.basename(file).replace(extName, '')
        let out_path  = path.join(file_path,`${file_name}.txt`)
        save_npc_declaration(file_name, rowval[1]);
        fs.writeFileSync(out_path, `"${kvImport}" ${jskv.encode(kv_data)}`);
        // return `${extName}->kv成功=> ${outpath} , \n项目总数 ->${datasum}`;

    } else {
        for(const i in kv_data){
            if(!locali_data[i]){
                locali_data[i]={ Language: i, Tokens:{} }
            }
            for (const j in kv_data[i]) {
                locali_data[i].Tokens[j] = kv_data[i][j];
            }
        }
    }
}

(async () => {
    for(const path_root in path_excel){
        const path_from = `表格\\${path_root}`;
        const path_goto = path_excel[path_root];
        const bNpc = path_root=='数据';
        const fils = read_all_files(path_from)
        fils.forEach(
            (file,index) => pb.render({ 
                completed: index,
                total: fils.length-1,
                err:single_excel_filter(file, bNpc, path_from, path_goto)
            })
        );
        if(!bNpc) {save_lang_kv(path_goto)}
    }
    program.option('-w, --watch', 'Watch Mode').parse(process.argv);
    if (program.watch) {
        console.log('进入后台同步');
        for(const path_root in path_excel){
            const path_from = `表格\\${path_root}`;
            const path_goto = path_excel[path_root];
            const bNpc = path_root=='数据';
            chokidar.watch(path_from).on('change', (file) => {
                console.log(single_excel_filter(file, bNpc, path_from, path_goto))
                if(!bNpc) {save_lang_kv(path_goto)}
                
            });
        }
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
