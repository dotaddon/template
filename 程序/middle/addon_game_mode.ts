import Activate from './init/Activate';
import Precache from './init/Precache';
Object.assign(getfenv(), { Activate, Precache });
