import numeral from 'numeral';
import unit from './unit';

export default function format(
  value,
  settlementCurrencyId = null,
  {
    showUnit = false,
  } = {},
) {
  const formattedValue = numeral(value).format('0,0');
  const currencyUnit = showUnit && settlementCurrencyId !== null
    ? unit(settlementCurrencyId)
    : '';

  if (!currencyUnit) {
    return formattedValue;
  }

  return `${formattedValue} ${currencyUnit}`;
}

export const makeFormat = (settlementCurrencyId, options) =>
  (value, customOptions) =>
    format(value, settlementCurrencyId, customOptions || options);
