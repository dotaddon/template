import { GameMode } from '../system/game_mode';

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}
export default () => {
    require('./custom_game_settings_gui');
    GameRules.Addon = new GameMode();
    print('hello Dota2');
};

GameRules.Addon?.Reload();
