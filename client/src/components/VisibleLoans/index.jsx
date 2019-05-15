import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import {
  errorLog,
} from '../../utils/log';
import {
  randomInt,
} from '../../utils/random';
import LoanList from '../LoanList';

class VisibleLoans extends PureComponent {
  constructor(props) {
    super(props);

    this.fakeLoadingStartStamp = Date.now();

    this.state = {
      isFakeLoading: true,
    };
  }

  ensureMinLoadingEffect() {
    const {
      minLoadingBufferTime,
    } = this.props;
    const timePass = Date.now() - this.fakeLoadingStartStamp;
    this.fakeLoadingStartStamp = 0;
    const delay = Math.max(
      0,
      randomInt(minLoadingBufferTime, minLoadingBufferTime + 500) - timePass,
    );

    setTimeout(
      this.stopFakeLoading,
      delay,
    );
  }

  stopFakeLoading = () => {
    this.setState({
      isFakeLoading: false,
    });
  };

  render() {
    const {
      Query,
      loanType,
      emptyMessage,
      currentAddress,
      defaultSortBy,
      defaultSortOrder,
      numberOfPlaceholders,
    } = this.props;
    const {
      isFakeLoading,
    } = this.state;

    return (
      <Query
        loanType={loanType}
        currentAddress={currentAddress}
      >
        {({
          data: {
            loans,
          },
          error,
          isLoading,
        }) => {
          if (error) {
            errorLog(error);
          }
          if (!isLoading && this.fakeLoadingStartStamp) {
            this.ensureMinLoadingEffect();
          }

          if (!isFakeLoading
            && !isLoading
            && (!loans || loans.length === 0)
            && emptyMessage
          ) {
            return (
              <Block
                padding="l"
                align="center"
              >
                <Text
                  text={emptyMessage}
                />
              </Block>
            );
          }

          return (
            <LoanList
              loans={(!isFakeLoading && loans) || []}
              currentAddress={currentAddress}
              defaultSortBy={defaultSortBy}
              defaultSortOrder={defaultSortOrder}
              numberOfPlaceholders={numberOfPlaceholders}
              isLoading={isLoading || isFakeLoading}
            />
          );
        }}
      </Query>
    );
  }
}

VisibleLoans.propTypes = {
  Query: PropTypes.func.isRequired,
  loanType: PropTypes.oneOf([
    'pending',
    'lender',
    'borrower',
  ]).isRequired,
  defaultSortBy: PropTypes.string,
  defaultSortOrder: PropTypes.any,
  emptyMessage: PropTypes.string,
  currentAddress: PropTypes.string.isRequired,
  numberOfPlaceholders: PropTypes.number,
  minLoadingBufferTime: PropTypes.number,
};

VisibleLoans.defaultProps = {
  emptyMessage: '',
  numberOfPlaceholders: 3,
  minLoadingBufferTime: 200, // ms
};

export default VisibleLoans;
