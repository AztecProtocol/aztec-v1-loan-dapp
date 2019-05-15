import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
} from '@aztec/guacamole-ui';
import {
  orderedCurrencies,
} from '../../config/settlementCurrency';
import AssetRow from '../AssetRow';
import QueryUserBalance from '../../queries/QueryUserBalance';
import getCurrencyIdToNotes from './utils/getCurrencyIdToNotes';

const Assets = ({
  currentAddress,
}) => (
  <QueryUserBalance
    currentAddress={currentAddress}
  >
    {({
      data,
      error,
      isLoading,
    }) => {
      let balanceNotes = [];
      if (!error && !isLoading) {
        balanceNotes = data.balance || [];
      }

      const idToNotes = getCurrencyIdToNotes(balanceNotes);

      return orderedCurrencies.map(({
        id,
        name,
        unit,
        icon,
      }) => {
        return (
          <Block
            key={id}
            padding="m 0"
          >
            <AssetRow
              name={name}
              currencyId={id}
              unit={unit}
              img={icon}
              balanceNotes={idToNotes[id] || []}
            />
          </Block>
        );
      });
    }}
  </QueryUserBalance>
);

Assets.propTypes = {
  currentAddress: PropTypes.string,
};

export default Assets;
