const fs = require('fs-extra');
const path = require('path');
const xlsx = require('node-xlsx');
const jskv = require('dota-js-kv');
const program = require('commander');
const chokidar = require('chokidar');
const { read_all_files, read_sub_directories } = require('./utils');


const path_form = 'excels/npc';         // 需要读取的excel路径
const path_goto = 'game/scripts/npc';   // 导出的KV路径
const excel_keyname = 1;                // 第二行存键名

const clean_data = (da) => {
    if (!isNaN(da)) {
        let number = parseFloat(da);
        if (number % 1 != 0)
            da = number.toFixed(4);
    }
    return da.toString();
};

const IsNull = (p)=>p == null|| (p == '' && typeof(p)!='number' );//|| p == ''

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
                dct[key_name] = { var_type: `FIELID_${has_float ? 'FLOAT' : 'INTEGER'}`, [ !IsNull(special_key_name) ? special_key_name : `var_${key_name}`]: data };
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

function single_excel_to_kv(rowval) {
    let key_row = rowval[excel_keyname];
    let key_in_column = (key_row[0] == 'vertical_keys')?
        (val)=>val[1].toString():
        (val,key)=>row_data_to_dict( key, val, 1).dct;

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

function single_excel_filter(file) {
    console.log(`excel 2 kv 编译器:`);
    if ( file.indexOf('.xls') <0
     || file.indexOf('~$') >= 0 )
        return console.log(`忽略非Excel文件=> ${file}`);

    let sheets = xlsx.parse(file);
    let sheet  = sheets[0];
    let rowval = sheet.data;
    if (rowval.length < excel_keyname+2)
        return console.log(`忽略空白文件=>${file}\n  至少需要${excel_keyname+2}行（注释，关键数据）`);

    let kv_data = single_excel_to_kv(rowval);
    let datasum = Object.keys(kv_data).length;
    if (datasum <= 0)
        return console.log(`忽略异常文件=>${file}\n  实际数据长度只有${datasum}`);

    let outpath = file
        .replace('\\', '/')
        .replace(path_form, path_goto)
        .replace('.xlsx', '.txt');
    let parenti = outpath.lastIndexOf('/');
    let out_dir = outpath.substr(0, parenti);
    if (!fs.existsSync(out_dir)) fs.mkdirSync(out_dir);
    fs.writeFileSync(outpath, jskv.encode({addon_title:kv_data}).replace("addon_title","西索酱's excels tool"));
        return console.log(`${path.extname(file)}->kv成功=> ${outpath} , \n项目总数 ->${datasum}`);
}

const all_excel_to_kv = async (path) => {
    const files = read_all_files(path_form);
    files.forEach((file) => {
        single_excel_filter(file);
    });
};

(async () => {
    all_excel_to_kv();
    program.option('-w, --watch', 'Watch Mode').parse(process.argv);
    if (program.watch) {
        console.log('进入后台同步');
        chokidar.watch(path_form).on('change', (file) => {
            single_excel_filter(file);
        });
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
