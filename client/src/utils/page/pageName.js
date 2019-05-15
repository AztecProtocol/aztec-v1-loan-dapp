import {
  errorLog,
} from '../log';
import {
  PAGE_NAME,
} from '../../config/page';

export default function pageName(name) {
  if (!PAGE_NAME[name]) {
    errorLog(`Page name not defined: ${name}`);
  }

  return PAGE_NAME[name];
}
