import { render } from '@mobilc/panorama-react-dom';

// 默认在左间渲染的红色Hello Panorama标志，从这里开始修改为你自己喜欢的

render(<Label hittest={false} text={'Hello Panorama'} style={{ fontSize: '80px', align: 'left center' }} />, $.GetContextPanel());

if (Game.IsInToolsMode()) {
    setTimeout(() => {
        const cc = $.CreatePanel("Panel", $.GetContextPanel(), "test");
        cc.BLoadLayout("file://{resources}/layout/custom_game/images_precache.xml", true, false);
        $.Msg("[loading] prechache:");
    }, 1000);
}
