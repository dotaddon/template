import { PanelAttributes } from '@mobilc/panorama-react-dom';
import { useState } from 'react';
import './react_panorama.scss'

let lableStyle: PanelAttributes['Panel']['style'] = { horizontalAlign: 'center', color: 'red',  };
export function ReactLogo(): JSX.Element {
    const [click, setClick] = useState<number>(0);
    return (
        <Panel style={{ flowChildren: 'down', verticalAlign: 'center', horizontalAlign: 'center' }}>
            <Label className='lableStyle' style={{ ...lableStyle, fontSize: '120px' }} text="Hello Dota!" />
            <Label className='lableStyle' style={{ ...lableStyle, fontSize: '30px' }} text="https://github.com/ark120202/react-panorama" />
            <Label className='lableStyle' style={{ ...lableStyle, fontSize: '30px' }} text="编辑 程序/hud/components/react_panorama.tsx 以移除此界面" />
            <Button
                className="ButtonBevel"
                onactivate={() => {
                    setClick(click + 1);
                    GameEvents.SendCustomGameEventToServer('c2s_test_event', {});
                }}
            >
                <Label text={`Test UIEvent ${click}`} />
            </Button>
        </Panel>
    );
}
