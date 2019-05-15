import {
  errorLog,
} from '../log';
import {
  PAGE_NAME,
} from '../../config/page';
import {
  routes,
} from '../../config/page';

export default function getPathByPageName(name) {
  if (!PAGE_NAME[name]) {
    errorLog(`Page name not defined: ${name}`);
  }

  const page = routes.find(route => route.name === name);
  return page ? page.path : '';
}
