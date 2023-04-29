import * as listParticle from './listParticle.json';
import * as listSound from './listSound.json';
import * as listModel from './listModel.json';

export default function (this: CScriptPrecacheContext) {
    if (IsInToolsMode())
        return;

    listParticle
        .map(e => PrecacheResource('particle', e, this));
    listSound
        .map(e => PrecacheResource('soundfile', e, this));
    listModel
        .map(e => PrecacheModel(e, this))

    print('[完成] 资源预载入')
}
