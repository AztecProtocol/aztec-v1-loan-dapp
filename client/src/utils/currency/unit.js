import {
  currencyIdMapping,
} from '../../config/settlementCurrency';
import {
  errorLog,
} from '../log';

export default function unit(id) {
  if (!currencyIdMapping[id]) {
    errorLog(`Settlement currency id not defined: ${id}`);
  }

  const {
    unit,
  } = currencyIdMapping[id];

  return unit || '';
};
