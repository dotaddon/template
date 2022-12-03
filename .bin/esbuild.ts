import { build } from 'esbuild'
import { pack,CreateLayout, layoutFileType } from '@mobilc/utils';
import { xml } from '../layout.config.json'; 

const bDev = process.argv.includes('--watch')
const config = xml as layoutFileType[]
CreateLayout(config)
build(pack(config).watch())
    .then(() => console.log('watch...'))
    // .catch(() => process.exit(1))

