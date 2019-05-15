import CurrencyService from '../../../helpers/CurrencyService';
import SETTLEMENT_CURRENCIES from '../../../config/settlementCurrency';

const getCurrencyAddressToId = () => {
  const addressMapping = {};
  Object.keys(SETTLEMENT_CURRENCIES).forEach((id) => {
    const address = (CurrencyService.getZKAddress(id) || '').toLowerCase();
    addressMapping[address] = id;
  });

  return addressMapping;
};

export default function getCurrencyIdToNotes(notes) {
  const idMapping = {};
  const addressMapping = getCurrencyAddressToId();
  notes.forEach((note) => {
    const currencyId = addressMapping[note.currencyAddress.toLowerCase()];
    if (!idMapping[currencyId]) {
      idMapping[currencyId] = [];
    }
    idMapping[currencyId].push(note);
  });

  return idMapping;
}
