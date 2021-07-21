const fs = require('fs-extra');
const path = require('path');
const xlsx = require('node-xlsx');
const jskv = require('dota-js-kv');
const program = require('commander');
const chokidar = require('chokidar');
const { read_all_files, ProgressBar, kvImport } = require('./utils');

const pb = new ProgressBar('excel 2 kv 编译器',5);
const path_excel ={
    数据:'数据',
    方言:'资源',
}
const excel_keyname = 1; // 第二行存键名
let locali_data = {};
let declaration = {};

const clean_data = da => {
    if (!isNaN(da)) {
        let number = parseFloat(da);
        if (number % 1 != 0)
            da = number.toFixed(4);
    }
    return da.toString();
};

const IsNull = p=> p == null|| (p == '' && typeof(p)!='number' );//|| p == ''

const depth  = n=> {
    let str = '';
    let index = 0
    do {
        str += '  ';
        index++;
    } while (index<=n);
    return str;
}

function row_data_to_dict( key_names, row_data, i, parent_name) {
    let dct = {};
    if (parent_name == null) parent_name = '';
    while (i < row_data.length && i < key_names.length) {
        key_name = key_names[i];
        if (IsNull(key_name )) {
            i++;
            continue;
        }
        key_name = key_name.toString();
        if (key_name.indexOf('[{]') >= 0) {
            i++;
            let pn = key_name.replace('[{]', '');
            let ret_val = row_data_to_dict( key_names, row_data, i, pn);
            dct[pn] = ret_val.dct;
            i = ret_val.i + 1;
        } else if (key_name.indexOf('[}]') >= 0) {
            return { dct: dct, i: i };
        } else {
            data = row_data[i];
            if (IsNull(data )) {
                i++;
                continue;
            }

            // 处理AttachWearables
            if (parent_name == 'AttachWearables') {
                dct[key_name] = { ItemDef: clean_data(data) };
            } else if (parent_name == 'AbilitySpecial') {
                // 写入ability specials
                let datas = data.toString().split(' ');
                let has_float = false;
                let special_key_name;
                datas.forEach((d) => {
                    if (isNaN(d)) special_key_name = d;
                    else if (parseFloat(d) % 1 != 0) has_float = true;
                });
                data = clean_data(data)
                    .replace(special_key_name + ' ', '')
                    .replace(special_key_name, '');
                dct[key_name] = { var_type: `FIELD_${has_float ? 'FLOAT' : 'INTEGER'}`, [ !IsNull(special_key_name) ? special_key_name : `var_${key_name}`]: data };
            } else {
                dct[key_name] = clean_data(data);
            } 
            // else if (key_name.indexOf('Ability') >= 0) {
            //     // 这里要注意，只要定义了技能的key，哪怕没有数据，也要填一个"”，否则不能正确覆盖为空技能
            //     dct[key_name] = '';
            // }
            i++;
        }
    }
    return { dct: dct, i: i };
}

function single_excel_to_npc(rowval) {
    let key_row = rowval[excel_keyname];
    let key_in_column = (key_row[0] == 'vertical_keys')?
        (val)=>val[1].toString():
        (val,key)=>row_data_to_dict( key, val, 0).dct;

        let kv_data = {};
    for (i = excel_keyname+1; i < rowval.length; ++i) {
        let row_data = rowval[i];
        let main_key = row_data[0];
        if (main_key == null) continue;
        let ret_val = key_in_column( row_data,key_row );
        kv_data[main_key] = ret_val;
    }
    return kv_data;
}

function single_excel_to_localze(rowval) {
    let key_row = rowval[excel_keyname];
    let key_in_column = (val)=>val.toString();
    let kv_data = {};

    for (j = 1; j < key_row.length; ++j) {
        let language = key_row[j]
        kv_data[language]={}
        for (i = excel_keyname+1; i < rowval.length; ++i) {
            let row_data = rowval[i];
            let main_key = row_data[0];
            if (main_key == null) continue;
            let ret_val = row_data[j];
            if (ret_val == null) continue;
            kv_data[language][main_key] = key_in_column(ret_val);
        }
    }
    return kv_data;
}

const save_lang_kv = async (path) => {
    let index = 0
    for (const language in locali_data) {
        let file_name = `/addon_${language.toLowerCase()}.txt`;
        fs.writeFileSync(path+file_name, `"${kvImport}" ${jskv.encode(locali_data[language])}`);
        pb.render({ 
            completed: index++,
            total: 1+index,
            msg:`写入语言文件完成 => ${file_name}`
        })
    }
}

const save_npc_declaration = async (file_name, keys) => {
    if( declaration[file_name] == keys)
        return;

    declaration[file_name.replace('npc\\','')] = keys;
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
    if ( ( extName!= '.xlsx' && extName != '.xls')
     || file.indexOf('~$') >= 0 )
        return `忽略非Excel文件=> ${file}`;

    let sheets = xlsx.parse(file);
    let sheet  = sheets[0];
    let rowval = sheet.data;
    if (rowval.length < excel_keyname+2)
        return `忽略空白文件=>${file}\n  至少需要${excel_keyname+2}行（注释，关键数据）`;

    let kv_data = bNpc ? single_excel_to_npc(rowval) : single_excel_to_localze(rowval);
    let datasum = Object.keys(kv_data).length;
    if (datasum <= 0)
        return `忽略异常文件=>${file}\n  实际数据长度只有${datasum}`;

    if(bNpc){
        let outpath = file
            .replace('\\', '/')
            .replace(path_from, path_goto)
            .replace('.xlsx', '.txt');
        let parenti = outpath.lastIndexOf('/');
        let out_dir = outpath.substr(0, parenti);

        let file_name = outpath.substr(parenti+1, outpath.length).replace('.txt', '');
        save_npc_declaration(file_name, rowval[1]);

        if (!fs.existsSync(out_dir)) fs.mkdirSync(out_dir);
        fs.writeFileSync(outpath, `"${kvImport}" ${jskv.encode(kv_data)}`);
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
        const path_from = `表格/${path_root}`;
        const path_goto = path_excel[path_root];
        const bNpc = path_root=='npc';
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
            const path_from = `表格/${path_root}`;
            const path_goto = path_excel[path_root];
            const bNpc = path_root=='npc';
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
