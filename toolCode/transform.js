

const clean_data = da => {
    if (!isNaN(da)) {
        let number = parseFloat(da);
        if (number % 1 != 0)
            da = number.toFixed(4);
    }
    return da.toString();
};

const IsNull = p=> p == null|| (p == '' && typeof(p)!='number' );//|| p == ''

module.exports.default = ( row_data, key_names) => {
    if (row_data.length<=2)
        return row_data[1].toString();

    let i = -1 // 从0开始读表头
    const row_data_to_dict = parent_name =>{
        let dct = {};
        while (i < row_data.length && i < key_names.length) {
            i++;
            key_name = key_names[i];
            if (IsNull(key_name )) continue;
    
            key_name = key_name.toString();
            if (key_name.indexOf('[}]') >= 0) {
                return dct;
            } else if (key_name.indexOf('[{]') >= 0) {
                let pn  = key_name.replace('[{]', '');
                dct[pn] = row_data_to_dict(pn);
            } else {
                data = row_data[i];
                if (IsNull(data ))  continue;
    
                switch (parent_name) {
                    case 'AttachWearables':// 处理AttachWearables
                        dct[key_name] = { ItemDef: clean_data(data) };
                        break;
                    case 'AbilitySpecial':// 写入ability specials
                        let datas = data.toString().split(' ');
                        let has_float = false;
                        let special_key_name;
                        datas.forEach((d) => {
                            if (isNaN(d)) special_key_name = d;
                            else if (parseFloat(d) % 1 != 0) has_float = true;
                        });
                        data = clean_data(data)
                            .replace(special_key_name + '\n', special_key_name + ' ')
                            .replace(special_key_name + ' ',  special_key_name)
                            .replace(special_key_name, '');
                        dct[key_name] = { var_type: `FIELD_${has_float ? 'FLOAT' : 'INTEGER'}`, [ !IsNull(special_key_name) ? special_key_name : `var_${key_name}`]: data };
                        break;
                
                    default:
                        dct[key_name] = clean_data(data);
                        break;
                }
            }
        }
        return dct;
    }

    return row_data_to_dict('')

}