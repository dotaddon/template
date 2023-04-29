import { pack, CreateLayout, layoutFileType } from '@dotaddon/packer';
import layout from '../程序/panorama/layout.config.json';
import { watch } from 'rollup';

const xml = layout.xml as layoutFileType[]
const config = pack(xml).compiler()

let watcher = watch(config)

process.on('exit', () => {
    watcher.close()
})

watcher.on('event', event => {
    switch (event.code) {
        case 'START':
            break;
        case 'END':
            CreateLayout(xml)
            if (!process.argv.includes('--watch'))
                process.exit(1)
            break;
        case 'BUNDLE_END':
            console.info('编译', event.input, event.duration, 'ms')
            break;
        case 'ERROR':
            console.error(event.error)
            break;
    }
})