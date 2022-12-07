import { build } from 'esbuild'
import { pack, CreateLayout, layoutFileType } from '@mobilc/utils';
import layout from '../layout.config.json';

const xml = layout.xml as layoutFileType[]
const config = pack(xml).watch()

build(config)
    .then(() => {
        CreateLayout(xml)
        console.log('watch...')
    })
    .catch(e => console.error(e))

