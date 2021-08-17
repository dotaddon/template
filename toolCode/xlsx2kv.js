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
    'Tokens',
    'DOTA_Tooltip_',
    'DOTA_Tooltip_ability_',
    'DOTA_Tooltip_Ability_item_',
]
const path_excel ={
    数据:'编译\\game\\scripts\\npc',
    方言:'资源',
}
const declaraPath = '交互\\declaration';
const excel_keyname = 1; // 第二行存键名
let locali_data = {};
let declaration = {};

function key_in_top(rowval, sheetName) {
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

function key_in_left(rowval, sheetName) {
    let key_row = rowval[excel_keyname];
    let kv_data = {};
    let prekey = sheetName.indexOf('Tooltip')>0 ? sheetName : '';
    let parent = []
    for (let j = 1; j < key_row.length; j++) {
        let kye_j = key_row[j];
        if(!kye_j ) continue;
            kye_j = kye_j.toString();
        if( kye_j.indexOf('[}]')>=0) {
            parent.pop() 
            continue ;
        }
        
        parent.push(kye_j.replace('[{]',''));
        let lastArr = parent.reduce((pre,cur)=> pre[cur] = pre[cur] || {} ,kv_data)
        if( kye_j.indexOf('[{]')<0) parent.pop();

        for (i = excel_keyname+1; i < rowval.length; ++i) {
            let row_data = rowval[i];
            let main_key = row_data[0];
            if (main_key == null) continue;
            let ret_val = row_data[j];
            if (ret_val == null) continue;
            lastArr[prekey+main_key] = ret_val.toString();
        }
    }
    let kv_keys = Object.keys(kv_data)
    if(kv_keys.length<=1) kv_data = kv_data[kv_keys[0]]
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

const save_npc_declaration = async (dir) => {
    const path_into = path.join(dir,`async_customdata.d.ts`);
    let str = 'declare interface CustomUIConfig {\n';
    for(const name in declaration){
        let key_in_column = transform[`declare_${declaration[name].name}`] || transform.declare_default;
        str += `  ${name}:{\n${key_in_column(declaration[name].keys)}  },\n`;
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

    let kv_data = vertical_key.indexOf(sheet.name )<0 ? key_in_top(rowval,sheet.name) : key_in_left(rowval,sheet.name);
    let datasum = Object.keys(kv_data).length;
    if (datasum <= 0)
        return `忽略异常文件=>${file}\n  实际数据长度只有${datasum}`;

    if(bNpc){
        let file_path = path.dirname(file).replace(path_from, path_goto)
        let file_name = path.basename(file).replace(extName, '')
        let out_path  = path.join(file_path,`${file_name}.kv`)
        if( !declaration[file_name] || declaration[file_name].keys != rowval[1]){
            declaration[file_name.replace('数据\\','')] = {keys:rowval[1], name:sheet.name}
        }
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
    if(!fs.existsSync(declaraPath)) fs.mkdirSync(declaraPath);
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
        else{save_npc_declaration(declaraPath)}
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
                else{save_npc_declaration(declaraPath)}
                
            });
        }
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
