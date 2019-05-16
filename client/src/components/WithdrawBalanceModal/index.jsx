import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  MaskedNumberInput,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import {
  makeFormat,
} from '../../utils/currency'
import {
  withdrawBalance,
} from '../../utils/loan';
import {
  errorLog,
} from '../../utils/log';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';
import Transferring from '../Transferring';

class WithdrawBalanceModal extends PureComponent {
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
      balanceValue,
      payableInterest,
    } = this.props;

    this.setState(
      {
        amount: Math.max(0, balanceValue - payableInterest),
        showModal: true,
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

  handleClearError = () => {
    this.setState({
      error: '',
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      isSubmitting: true,
    });
    this.withdrawBalance();
  };

  withdrawBalance = async () => {
    const {
      amount,
    } = this.state;
    const {
      loan,
    } = this.props;
    const {
      address: loanAddress,
      balanceNote,
      lender,
    } = loan;

    try {
      const withdrawnAmount = await withdrawBalance({
        loanAddress,
        amount,
        balanceSharedSecret: balanceNote.sharedSecret,
        lender,
      });

      if (withdrawnAmount !== amount) {
        this.setState({
          isSubmitting: false,
          error: `Withdraw amount ${this.format(withdrawnAmount)} failed. Please try again later.`,
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
        error: 'Something went wrong. Please try again later.',
      });
    }
  };

  renderContent() {
    const {
      error,
      justSubmmited,
      isSubmitting,
      amount,
    } = this.state;

    if (error) {
      return (
        <Message
          type="error"
          message={error}
        />
      );
    }

    if (justSubmmited) {
      return (
        <Message
          type="success"
          message={`${this.format(amount, { showUnit: true })} Withdrawn!`}
        />
      );
    }

    if (isSubmitting) {
      return (
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
              name="account_box"
              size="l"
              color="grey"
            />
          )}
        />
      );
    }

    const {
      balanceValue,
      payableInterest,
    } = this.props;
    const overdueInterest = payableInterest - balanceValue;

    return (
      <div>
        <InputRow
          label="Account Balance:"
          value={this.format(balanceValue)}
        />
        <InputRow
          label="Owed Interest:"
          value={this.format(payableInterest)}
        />
        {overdueInterest > 0 && (
          <InputRow
            label="Overdue Interest:"
            value={(
              <Text
                text={this.format(overdueInterest)}
                color="red"
                weight="bold"
              />
            )}
          />
        )}
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
    );
  }

  renderModal() {
    const {
      showModal,
      justSubmmited,
      error,
    } = this.state;

    if (!showModal) return null;

    let closeButtonText = 'Cancel';
    let submitButtonText = 'Withdraw';
    let onSubmit = this.handleSubmit;
    if (error) {
      submitButtonText = 'Try Again';
      onSubmit = this.handleClearError;
    } else if (justSubmmited) {
      closeButtonText = 'Close';
      onSubmit = null;
    }

    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      isSubmitting,
    } = this.state;

    return (
      <LoanModal
        key="modal"
        title="Withdraw Balance"
        loan={loan}
        notionalValue={notionalValue}
        submitButtonText={submitButtonText}
        closeButtonText={closeButtonText}
        onClose={this.handleCloseModal}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      >
        {this.renderContent()}
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

WithdrawBalanceModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    maturity: PropTypes.number.isRequired,
    settlementCurrencyId: PropTypes.string.isRequired,
    balanceNote: PropTypes.shape({
      sharedSecret: PropTypes.string,
    }),
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number.isRequired,
  payableInterest: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired,
};

export default WithdrawBalanceModal;
