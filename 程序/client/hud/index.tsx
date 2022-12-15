import { render } from '@mobilc/panorama-react-dom';
import { ReactLogo } from './components/react_panorama';
import './settings';

// 默认在中间渲染的红色REACT-PANORAMA标志，从这里开始修改为你自己喜欢的
render(<ReactLogo />, $.GetContextPanel());
