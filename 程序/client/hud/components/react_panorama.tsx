import React, { useState } from "react";

let lableStyle:Partial<VCSSStyleDeclaration> = { horizontalAlign: "center", color: "red", fontWeight: "bold", opacity: "0.3" }
export function ReactLogo(): JSX.Element  {
    const [click,setClick] = useState<number>(0)
    return (
        <Panel style={{ flowChildren: "down", verticalAlign: "center", horizontalAlign: "center" }}>
            <Label style={{...lableStyle,fontSize: "120px"}} text="REACT-PANORAMA" />
            <Label style={{...lableStyle,fontSize: "30px"}} text="https://github.com/ark120202/react-panorama" />
            <Label
                style={{...lableStyle,fontSize: "30px"}}
                text="编辑 交互/hud/components/react_panorama.tsx 以移除此界面"
            />
            <Button
                className="ButtonBevel"
                onactivate={() => {
                    setClick(click+1)
                    GameEvents.SendCustomGameEventToServer("c2s_test_event", {});
                }}
            >
                <Label text={`Test UIEvent${click}`} />
            </Button>
        </Panel>
    );
}
