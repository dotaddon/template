
import { getAddonPath, listen } from '@dotaddon/rigger';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const { server } = getAddonPath()
listen(['程序/shared/nettable/dota_net_table_keys.json'],async file=>{
    
    let w = `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
    custom_net_tables = ${readFileSync('程序/shared/nettable/dota_net_table_keys.json')}
}`
    writeFileSync(join(server, 'scripts', 'custom_net_tables.txt'), w)
})