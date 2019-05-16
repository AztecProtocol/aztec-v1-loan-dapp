import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  FlexBox,
  Row,
  Offset,
  Block,
  Text,
  DeviceWidthListener,
} from '@aztec/guacamole-ui';
import {
  systemDateFormat,
  displayedDateFormat,
  displayedTimeFormat,
  displayedDateTimeFormat,
} from '../../config/datetime';
import loanStatus from '../../utils/loanStatus';
import replaceValue from '../../utils/replaceValue';
import {
  decryptNoteValue,
} from '../../utils/note';
import {
  unit as currencyUnit,
} from '../../utils/currency';
import Card from '../Card';
import LoanPlaceholder from '../LoanPlaceholder';
import EncryptedValue from '../EncryptedValue';
import LoanTermCol from './LoanTermCol';
import LoanTag from './LoanTag';
import ExtraInfoCols from './ExtraInfoCols';
import LoanActions from './LoanActions';

class Loan extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      currentAddress,
      loan,
    } = nextProps;
    const {
      currentAddress: prevAddress,
      loan: prevLoan,
    } = prevState.prevProps;
    if (currentAddress === prevAddress
      && loan === prevLoan
    ) {
      return null;
    }

    let {
      notional,
      balance,
    } = prevState;
    const {
      role,
      borrower,
      lender,
      notionalNote,
      balanceNote,
    } = loan;

    const notionalViewingKey = notionalNote.sharedSecret;
    notional = replaceValue(
      notional,
      'encryptedViewingKey',
      notionalViewingKey,
    );
    if (!notionalViewingKey) {
      notional = replaceValue(
        notional,
        'value',
        0,
      );
    }

    const {
      encryptedViewingKey: prevBalanceViewingKey,
    } = balance;
    const {
      sharedSecret: balanceSharedSecret,
    } = balanceNote || {};
    if (balanceSharedSecret !== prevBalanceViewingKey) {
      balance = replaceValue(
        balance,
        'encryptedViewingKey',
        balanceSharedSecret || '',
      );
      const shouldHaveAccess = currentAddress === borrower.address
        || (lender && currentAddress === lender.address);
      balance = replaceValue(
        balance,
        'value',
        balanceSharedSecret && !shouldHaveAccess ? 0 : null,
      );
    }

    return {
      role,
      notional,
      balance,
      prevProps: {
        currentAddress,
        loan,
      },
    };
  }

  constructor(props) {
    super(props);

    this.encrypted = [
      'notional',
      'balance',
    ];

    this.willUnmount = false;

    this.viewingKeyValueCache = new Map();

    this.state = {
      role: '',
      notional: {
        encryptedViewingKey: '',
        value: null,
        error: null,
      },
      balance: {
        encryptedViewingKey: '',
        value: null,
        error: null,
      },
      prevProps: {
        currentAddress: '',
        loan: {},
      },
    };
  }

  componentDidMount() {
    this.encrypted.forEach(key => this.decryptValue(key));
  }

  componentDidUpdate(prevProps, prevState) {
    this.encrypted.forEach((key) => {
      if (this.state[key].encryptedViewingKey !== prevState[key].encryptedViewingKey) {
        this.decryptValue(key);
      }
    });
  }

  componentWillUnmount() {
    this.willUnmount = true;
  }

  async decryptValue(key) {
    const {
      encryptedViewingKey,
      value: prevValue,
    } = this.state[key];

    let value = prevValue;
    let error = null;
    try {
      if (encryptedViewingKey) {
        value = await this.decryptNoteValue(encryptedViewingKey);
      }
    } catch (e) {
      value = 0;
      error = e;
    }
    if (this.willUnmount) return;

    if (value !== prevValue) {
      this.setState({
        [key]: {
          ...this.state[key],
          value,
          error,
        },
      });
    }
  }

  async decryptNoteValue(encryptedViewingKey) {
    if (!this.viewingKeyValueCache.has(encryptedViewingKey)) {
      const value = await decryptNoteValue({
        encryptedViewingKey,
      });

      this.viewingKeyValueCache.set(encryptedViewingKey, value);
    }

    return this.viewingKeyValueCache.get(encryptedViewingKey);
  }

  render() {
    const {
      loan,
      currentAddress,
    } = this.props;

    const {
      interestRate,
      interestPeriod,
      maturity,
      loanDuration,
      settlementCurrencyId,
      isLoading,
    } = loan;

    if (isLoading) {
      return <LoanPlaceholder />;
    }

    const displayedUnit = currencyUnit(settlementCurrencyId);

    const {
      role,
      notional,
      balance,
    } = this.state;
    const {
      encryptedViewingKey: notionalKey,
      value: notionalValue,
      error: notionalError,
    } = notional;
    const {
      value: balanceValue,
    } = balance;

    const isDecrypting = notionalValue === null;

    let maturityText = '';
    if (maturity) {
      const maturityMoment = moment(maturity, systemDateFormat);
      if (maturityMoment.isSame(moment(), 'day')) {
        maturityText = `Today at ${maturityMoment.format(displayedTimeFormat)}`;
      } else {
        maturityText = maturityMoment.format(displayedDateFormat);
      }
    }

    const content = (
      <Block padding="l xl">
        <Block
          top={isDecrypting ? '' : 'xs'}
          bottom={isDecrypting ? 'm' : 'l'}
          hasBorderBottom
        >
          <FlexBox
            align="space-between"
            valign="center"
          >
            <FlexBox valign="center">
              <EncryptedValue
                value={notionalValue}
                size="m"
                weight="semibold"
                loaderBackground="secondary"
                isDecrypting={isDecrypting}
                isEncrypted={!notionalKey || !!notionalError}
              />
              {!!displayedUnit && (
                <Block left="s">
                  <Text
                    text={` (${displayedUnit})`}
                    size="s"
                  />
                </Block>
              )}
            </FlexBox>
            {!!maturityText && (
              <Text
                className="hide-lte-xs"
                text={maturityText}
                size="s"
              />
            )}
            <div className="hide-gte-s">
              <LoanTag
                status={loan.status}
              />
            </div>
          </FlexBox>
        </Block>
        <Block top="m">
          <Offset margin="s 0">
            <Row>
              <LoanTermCol
                label="Loan Term"
                text={(
                  <FlexBox>
                    <Text
                      text={`${interestRate} %`}
                    />
                    <Block padding="0 m">
                      <Text
                        text="/"
                        color="label"
                        size="xs"
                      />
                    </Block>
                    <Text
                      text={`${interestPeriod} day${interestPeriod === 1 ? '' : 's'}`}
                      color="label"
                    />
                  </FlexBox>
                )}
              />
              <LoanTermCol
                label="Loan Duration"
                text={`${loanDuration} day${loanDuration === 1 ? '' : 's'}`}
              />
              {!!maturityText && (
                <LoanTermCol
                  className="hide-gte-s"
                  label="Maturity"
                  text={maturityText}
                />
              )}
              <ExtraInfoCols
                role={role}
                currentAddress={currentAddress}
                loan={loan}
                notionalValue={notionalValue}
                balanceValue={balanceValue}
              />
            </Row>
          </Offset>
        </Block>
      </Block>
    );

    const contentStub = (
      <Block
        padding="l"
        stretch
      >
        <FlexBox
          direction="column"
          align="space-between"
          valign="flex-end"
          stretch
        >
          <div className="hide-lte-xs">
            <LoanTag
              status={loan.status}
            />
          </div>
          <Offset
            className="expand"
            margin="xs 0"
          >
            <LoanActions
              role={role}
              currentAddress={currentAddress}
              loan={loan}
              notionalValue={notionalValue}
              balanceValue={balanceValue}
            />
          </Offset>
          {loan.status === loanStatus('repaid') && (
            <Block
              className="expand"
              bottom="xs"
              align="center"
            >
              <Text
                text={`Repaid on ${moment(loan.repaidAt).format(displayedDateTimeFormat)}`}
                color="label"
              />
            </Block>
          )}
        </FlexBox>
      </Block>
    );

    return (
      <DeviceWidthListener breakpoints={['s']}>
        {({ lt }) => (
          <Card
            orientation={lt.s ? 'vertical' : 'horizontal'}
            content={content}
            contentStub={contentStub}
          />
        )}
      </DeviceWidthListener>
    );
  }
}

Loan.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    borrower: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }).isRequired,
    lender: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }),
    notionalNote: PropTypes.shape({
      id: PropTypes.string.isRequired,
      sharedSecret: PropTypes.string,
    }).isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    maturity: PropTypes.number,
    settlementCurrencyId: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    repaidAt: PropTypes.number,
    balanceNote: PropTypes.shape({
      id: PropTypes.string.isRequired,
      sharedSecret: PropTypes.string,
    }),
  }).isRequired,
  currentAddress: PropTypes.string.isRequired,
};

export default Loan;
