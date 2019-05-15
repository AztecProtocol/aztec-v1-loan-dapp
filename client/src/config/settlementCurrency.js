import daiIcon from '../assets/dai.jpg';
import wethIcon from '../assets/weth.png';

const orderedCurrencies = [
  {
    id: '0',
    name: 'Dai',
    unit: 'DAI',
    icon: daiIcon,
  },
  {
    id: '1',
    name: 'WETH',
    unit: 'WETH',
    icon: wethIcon,
  },
];

const SETTLEMENT_CURRENCIES = {
  // id: id
};

const currencyIdMapping = {};

orderedCurrencies.forEach((currency) => {
  const {
    id,
  } = currency;
  SETTLEMENT_CURRENCIES[id] = id;
  currencyIdMapping[id] = currency;
});

export default SETTLEMENT_CURRENCIES;

export {
  orderedCurrencies,
  currencyIdMapping,
};
