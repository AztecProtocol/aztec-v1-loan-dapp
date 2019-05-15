import unit from './unit';
import format, {
  makeFormat,
} from './format';

import SETTLEMENT_CURRENCIES from '../../config/settlementCurrency';
import {
  errorLog,
} from '../log';

export const currency = (currencyName) => {
  if (!SETTLEMENT_CURRENCIES[currencyName]) {
    errorLog(`Settlement currency not defined: ${currencyName}`);
  }

  return SETTLEMENT_CURRENCIES[currencyName];
};

export default currency;

export {
  unit,
  format,
  makeFormat,
};
