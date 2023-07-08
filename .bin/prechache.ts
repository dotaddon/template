import { precache_compiler } from "@dotaddon/rigger";

precache_compiler({
    exclude: ['vscripts/init'],
    output: {
        vpcf: '程序/vscripts/init/listParticle.json',
        vmdl: '程序/vscripts/init/listSound.json',
        vsndevts: '程序/vscripts/init/listModel.json'
    }
})