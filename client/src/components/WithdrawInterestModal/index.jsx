import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  MaskedNumberInput,
  Icon,
} from '@aztec/guacamole-ui';
import {
  errorLog,
} from '../../utils/log';
import {
  withdrawInterest,
  calculateInterestDuration,
} from '../../utils/loan';
import {
  makeFormat,
} from '../../utils/currency';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';
import Transferring from '../Transferring';

class WithdrawInterestModal extends PureComponent {
  constructor(props) {
    super(props);

    const {
      loan,
    } = props;
    const {
      settlementCurrencyId,
    } = loan;
    this.format = makeFormat(settlementCurrencyId);

    this.inputRef = null;

    this.state = {
      amount: 0,
      validatedAmount: null,
      validatedDuration: null,
      showModal: false,
      isSubmitting: false,
      justSubmmited: false,
      error: '',
    };
  }

  setInputRef = (ref) => {
    this.inputRef = ref;
  };

  handleOpenModal = () => {
    const {
      payableInterest,
      balanceValue,
    } = this.props;

    this.setState(
      {
        amount: Math.min(payableInterest, balanceValue),
        validatedAmount: null,
        validatedDuration: null,
        showModal: true,
        isSubmitting: false,
        justSubmmited: false,
        error: '',
      },
      this.handleFocusInput,
    );
  };

  handleCloseModal = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      showModal: false,
      justSubmmited: false,
    });
  };

  handleFocusInput() {
    if (!this.inputRef || !this.inputRef.focus) return;

    this.inputRef.focus();
  }

  handleChangeAmount = (amount) => {
    if (this.state.isSubmitting) return;
    this.setState({
      amount,
    });
  };

  clearErrorState = () => {
    this.setState(
      {
        validatedAmount: null,
        validatedDuration: null,
        error: '',
      },
      this.handleFocusInput,
    );
  };

  handleDiscardValidatedAmount = () => {
    const {
      validatedAmount,
    } = this.state;
    this.setState({
      amount: validatedAmount,
      validatedAmount: null,
      validatedDuration: null,
      error: '',
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState(
      {
        isSubmitting: true,
        error: '',
      },
      this.withdrawInterest,
    );
  };

  handleSubmitWithCustomAmount = (amount) => {
    if (this.state.isSubmitting) return;

    let {
      validatedAmount,
      validatedDuration,
    } = this.state;
    if (amount !== validatedAmount) {
      validatedDuration = null;
    }

    this.setState(
      {
        isSubmitting: true,
        amount,
        validatedDuration,
        error: '',
      },
      this.withdrawInterest,
    );
  };

  async withdrawInterest() {
    const {
      loan,
      totalInterest,
      payableInterest,
      balanceValue,
    } = this.props;
    const {
      amount: inputAmount,
      validatedDuration: duration,
    } = this.state;
    const amount = +inputAmount;
    const highestAmount = Math.min(balanceValue, payableInterest);

    if (amount > highestAmount) {
      this.setState({
        isSubmitting: false,
        error: 'overflow',
      });
      return;
    }

    const {
      interestRate,
      interestPeriod,
      viewRequest,
      balance,
      borrower,
      settledAt,
      maturity,
    } = loan;

    try {
      const withdrawnAmount = await withdrawInterest({
        loanAddress: loan.address,
        amount,
        duration,
        interestRate,
        interestPeriod,
        totalInterest,
        borrower,
        settledAt,
        maturity,
        notionalSharedSecret: viewRequest.sharedSecret,
        balanceSharedSecret: balance.sharedSecret,
      });

      if (withdrawnAmount !== amount) {
        let validatedDuration = null;
        let validatedAmount = withdrawnAmount;
        if (validatedAmount > highestAmount) {
          validatedAmount = highestAmount === amount
            ? amount - 1
            : highestAmount;
        } else {
          validatedDuration = calculateInterestDuration({
            amount,
            totalInterest,
            settledAt,
            maturity,
            timeUnit: 's',
            roundingMethod: 'ceil',
          })
        }
        this.setState({
          isSubmitting: false,
          error: 'duration',
          validatedAmount,
          validatedDuration,
        });
        return;
      }

      this.setState({
        justSubmmited: true,
        isSubmitting: false,
        error: '',
      });
    } catch (error) {
      errorLog(error);
      this.setState({
        isSubmitting: false,
        error: 'Something went wrong.',
      });
    }
  }

  renderSuccessModal() {
    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      amount,
    } = this.state;

    return (
      <LoanModal
        key="modal"
        title="Balance Withdrawn"
        loan={loan}
        notionalValue={notionalValue}
        onClose={this.handleCloseModal}
      >
        <Message
          type="success"
          message={`${this.format(amount, { showUnit: true })} Withdrawn!`}
        />
      </LoanModal>
    );
  }

  getButtonConfigs() {
    const {
      payableInterest,
      balanceValue,
    } = this.props;
    const {
      amount,
      validatedAmount,
      error,
    } = this.state;

    let errorMessage = error;
    let submitButtonText = '';
    let submitButtonAction;
    let closeButtonText = 'Cancel';
    let closeButtonAction = this.handleCloseModal;
    switch (error) {
      case 'overflow': {
        const highestAmount = Math.min(payableInterest, balanceValue);
        errorMessage = `Withdrawn amount can not be larger than ${this.format(highestAmount)}. Would you like to withdraw ${this.format(highestAmount, { showUnit: true })} instead?`;
        submitButtonText = `Withdraw ${this.format(highestAmount)}`;
        submitButtonAction = () => this.handleSubmitWithCustomAmount(highestAmount);
        closeButtonAction = this.clearErrorState;
        break;
      }
      case 'duration':
        errorMessage = `The amount ${this.format(amount)} can not be processed using a valid block time. Would you like to withdraw ${this.format(validatedAmount, { showUnit: true })} instead?`;
        submitButtonText = `Withdraw ${this.format(validatedAmount)}`;
        submitButtonAction = () => this.handleSubmitWithCustomAmount(validatedAmount);
        closeButtonAction = this.handleDiscardValidatedAmount;
        break;
      default: {
        if (!error) {
          submitButtonText = 'Withdraw';
          submitButtonAction = this.handleSubmit;
        } else {
          submitButtonText = 'Try Again';
          submitButtonAction = this.clearErrorState;
        }
      }
    }

    return {
      errorMessage,
      submitButtonText,
      submitButtonAction,
      closeButtonText,
      closeButtonAction,
    };
  }

  renderModal() {
    const {
      showModal,
      justSubmmited,
    } = this.state;
    if (!showModal) return null;

    if (justSubmmited) {
      return this.renderSuccessModal();
    }

    const {
      isSubmitting,
      amount,
    } = this.state;
    const {
      loan,
      notionalValue,
      balanceValue,
      payableInterest,
    } = this.props;
    const {
      errorMessage,
      submitButtonText,
      submitButtonAction,
      closeButtonText,
      closeButtonAction,
    } = this.getButtonConfigs();

    return (
      <LoanModal
        key="modal"
        title="Withdraw Interest"
        loan={loan}
        notionalValue={notionalValue}
        submitButtonText={submitButtonText}
        closeButtonText={closeButtonText}
        onClose={closeButtonAction}
        onSubmit={submitButtonAction}
        isSubmitting={isSubmitting}
      >
        {!!errorMessage && (
          <Message
            type="error"
            message={errorMessage}
          />
        )}
        {!errorMessage && !isSubmitting && (
          <div>
            <InputRow
              label="Account Balance:"
              value={this.format(balanceValue)}
            />
            <InputRow
              label="Accrued Interest:"
              value={this.format(payableInterest)}
            />
            <InputRow
              label="Withdraw Amount:"
            >
              <MaskedNumberInput
                setInputRef={this.setInputRef}
                size="l"
                value={amount}
                onChange={this.handleChangeAmount}
              />
            </InputRow>
          </div>
        )}
        {!errorMessage && isSubmitting && (
          <Transferring
            description={`Withdrawing ${this.format(amount, { showUnit: true })}`}
            from={(
              <Icon
                name="vpn_lock"
                size="l"
                color="grey"
              />
            )}
            to={(
              <Icon
                name="person"
                size="l"
                color="grey"
              />
            )}
          />
        )}
      </LoanModal>
    );
  }

  render() {
    const {
      children,
    } = this.props;

    return [
      children({
        onOpenModal: this.handleOpenModal,
      }),
      this.renderModal(),
    ];
  }
}

WithdrawInterestModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    maturity: PropTypes.number.isRequired,
    settlementCurrencyId: PropTypes.string.isRequired,
    balance: PropTypes.shape({
      sharedSecret: PropTypes.string,
    }),
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
  totalInterest: PropTypes.number.isRequired,
  payableInterest: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
};

export default WithdrawInterestModal;
