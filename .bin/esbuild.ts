import { build } from 'esbuild'
import { pack,CreateXml } from '@mobilc/utils';
import { xml } from '../layout.config.json';
const { watch } = pack(xml as any);

CreateXml(xml as any)
build({
    ...watch(),
    tsconfig:'src/client/tsconfig.json',
    logLevel:'info',
    external:['s2r://*'],
})
    .then(() => console.log('watch...'))
    // .catch(() => process.exit(1))

