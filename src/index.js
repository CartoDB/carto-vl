import Layer from '../contrib/layer';
import Dataset from '../contrib/dataset';
import { Style, parseStyle } from './style/index';

// Source namespace has dataset and Sql
const source = { Dataset };

export { Layer };
export { source };
export { Style };
export { parseStyle }; // TODO(@iago): temporal export, we must find a better place