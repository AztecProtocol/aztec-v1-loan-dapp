import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  MaskedNumberInput,
  Text,
  Icon,
} from '@aztec/guacamole-ui';
import {
  errorLog,
} from '../../utils/log';
import {
  randomInt,
} from '../../utils/random';
import {
  deposit,
} from '../../utils/erc20';
import {
  approveSpendERC20,
  payInterest,
} from '../../utils/loan';
import {
  makeFormat,
} from '../../utils/currency';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';
import Transferring from '../Transferring';

const ensureProcessingEffect = fn => setTimeout(() => {
  fn();
}, randomInt(1000, 2000));

class PayInterestModal extends PureComponent {
  constructor(props) {
    super(props);

    this.steps = [
      'confirm',
      'approve',
      'deposit-prompt',
      'deposit',
      'approve-failed',
      'payment',
      'payment-failed',
      'payment-success',
    ];

    this.stepsRequiredProcessing = [
      'approve',
      'deposit',
      'payment',
    ];

    const {
      loan,
    } = props;
    const {
      settlementCurrencyId,
    } = loan;
    this.format = makeFormat(settlementCurrencyId);

    this.inputRef = null;

    this.state = {
      step: this.steps[0],
      amount: 0,
      showModal: false,
      isSubmitting: false,
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
    const overdueInterest = payableInterest - balanceValue;

    this.setState(
      {
        step: this.steps[0],
        amount: overdueInterest > 0 ? overdueInterest : '',
        showModal: true,
      },
      this.handleFocusInput
    );
  };

  handleCloseModal = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      showModal: false,
    });
  };

  handleFocusInput() {
    if (!this.inputRef || !this.inputRef.focus) return;

    this.inputRef.focus();
  }

  handleChangeInterestAmount = (amount) => {
    if (this.state.isSubmitting) return;
    this.setState({
      amount,
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      isSubmitting: true,
    });
    this.payInterest();
  };

  goToStep = (step) => {
    if (this.stepsRequiredProcessing.indexOf(step) < 0) {
      this.setState({
        step,
        isSubmitting: false,
      });
      return;
    }

    this.setState(
      {
        step,
        isSubmitting: true,
      },
      () => ensureProcessingEffect(() => this.triggerStepAction(step)),
    );
  };

  triggerStepAction(step) {
    switch (step) {
      case 'approve':
        this.approveAmount();
        break;
      case 'deposit':
        this.depositAmount();
        break;
      case 'payment':
        this.payInterest();
        break;
      default:
    }
  }

  async approveAmount() {
    const amount = +this.state.amount;
    const {
      loan,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;
    let approvedAmount = 0;

    try {
      approvedAmount = await approveSpendERC20({
        amount,
        currencyId: settlementCurrencyId,
      });
    } catch (error) {
      errorLog(error);
    }

    if (approvedAmount === amount) {
      this.goToStep('payment');
    } else if (process.env.NODE_ENV !== 'production') {
      this.goToStep('deposit-prompt');
    } else {
      this.goToStep('approve-failed');
    }
  }

  async depositAmount() {
    const {
      amount,
    } = this.state;
    const {
      loan,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;

    try {
      await deposit({
        amount: +amount,
        currencyId: settlementCurrencyId,
      });

      this.goToStep('approve');
    } catch (error) {
      errorLog(error);
    }
  }

  payInterest = async() => {
    const {
      loan,
    } = this.props;
    const {
      address: loanAddress,
      settlementCurrencyId,
      balanceNote,
      lender,
    } = loan;
    const amount = +this.state.amount;

    try {
      const paidAmount = await payInterest({
        loanAddress,
        amount,
        currencyId: settlementCurrencyId,
        balanceSharedSecret: balanceNote.sharedSecret,
        lender,
      });

      if (paidAmount !== amount) {
        this.goToStep('payment-failed');
        return;
      }

      this.goToStep('payment-success');
    } catch (error) {
      errorLog(error);
      this.goToStep('payment-failed');
    }
  };

  renderModalContent() {
    const {
      notionalValue,
    } = this.props;
    const {
      step,
      amount,
    } = this.state;

    if (notionalValue === '') {
      return null;
    }

    switch (step) {
      case 'confirm': {
        const {
          balanceValue,
          payableInterest,
        } = this.props;
        const overdueInterest = Math.max(
          0,
          payableInterest - balanceValue,
        );

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
            <InputRow
              label="Overdue Interest:"
              value={(
                <Text
                  text={this.format(overdueInterest)}
                  color={overdueInterest > 0 ? 'red' : ''}
                  weight={overdueInterest > 0 ? 'bold' : ''}
                />
              )}
            />
            <InputRow
              label="Interest Amount:"
            >
              <MaskedNumberInput
                setInputRef={this.setInputRef}
                size="l"
                value={amount}
                onChange={this.handleChangeInterestAmount}
              />
            </InputRow>
          </div>
        );
      }
      case 'approve':
        return (
          <Transferring
            description="Approving transaction"
            from={(
              <Icon
                name="person"
                size="l"
                color="grey"
              />
            )}
            to={(
              <Icon
                name="vpn_lock"
                size="l"
                color="grey"
              />
            )}
          />
        );
      case 'deposit-prompt':
        return (
          <Block padding="m 0">
            <Block padding="s">
              <Text
                text="Oops!"
                size="s"
                weight="semibold"
              />
            </Block>
            <Block padding="s">
              <Text
                text="You don't have enough balance to pay interest. For demonstration purposes, here are some free tokens:"
                size="xs"
              />
            </Block>
            <Block padding="s">
              <Text
                text={this.format(amount)}
                size="l"
                weight="semibold"
                color="green"
              />
            </Block>
          </Block>
        );
      case 'deposit':
        return (
          <Transferring
            description={`Sending ${this.format(amount, { showUnit: true })} to your account`}
            from={(
              <Block
                padding="xs s"
                background="grey"
                borderRadius="l"
                inline
              >
                <Text
                  text="ERC20"
                  size="xxs"
                  weight="bold"
                />
              </Block>
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
      case 'approve-failed':
        return (
          <Message
            type="error"
            message="You don't have enough balance to pay interest."
          />
        );
      case 'payment':
        return (
          <Transferring
            description="Paying Interest"
            from={(
              <Icon
                name="style"
                size="l"
                color="grey"
              />
            )}
            to={(
              <Icon
                name="vpn_lock"
                size="l"
                color="grey"
              />
            )}
          />
        );
      case 'payment-success':
        return (
          <Message
            type="success"
            message={`Interest paid successfully! Amount paid: ${this.format(amount, { showUnit: true })}`}
          />
        );
      case 'payment-failed':
        return (
          <Message
            type="error"
            message="Something went wrong while paying interest. Please try again later."
          />
        );
      default:
    }

    return null;
  }

  getButtonConfigs() {
    const {
      notionalValue,
    } = this.props;
    if (notionalValue === '') {
      return {};
    }

    const {
      step,
    } = this.state;

    let submitButton;
    let closeButton;
    switch (step) {
      case 'confirm':
        submitButton = {
          text: 'Pay',
          onClick: () => this.goToStep('approve'),
        };
        closeButton = {
          text: 'Cancel',
          onClick: this.handleCloseModal,
        };
        break;
      case 'deposit-prompt':
        submitButton = {
          text: 'Accept',
          onClick: () => this.goToStep('deposit'),
        };
        closeButton = {
          text: 'Decline',
          onClick: () => this.goToStep('approve-failed'),
        };
        break;
      case 'approve-failed':
        closeButton = {
          text: 'Close',
          onClick: this.handleCloseModal,
        };
        break;
      case 'payment-success':
        closeButton = {
          text: 'Close',
          onClick: this.handleCloseModal,
        };
        break;
      case 'payment-failed':
        submitButton = {
          text: 'Try Again',
          onClick: () => this.goToStep('confirm'),
        };
        closeButton = {
          text: 'Cancel',
          onClick: this.handleCloseModal,
        };
        break;
      default:
    }

    return {
      submitButton,
      closeButton,
    };
  }

  renderModal() {
    const {
      showModal,
    } = this.state;
    if (!showModal) return null;

    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      isSubmitting,
    } = this.state;

    const {
      submitButton,
      closeButton,
    } = this.getButtonConfigs();

    return (
      <LoanModal
        key="modal"
        title="Pay Interest"
        loan={loan}
        notionalValue={notionalValue}
        submitButtonText={submitButton && submitButton.text}
        closeButtonText={closeButton && closeButton.text}
        onClose={closeButton && closeButton.onClick}
        onSubmit={submitButton && submitButton.onClick}
        isSubmitting={isSubmitting}
      >
        {this.renderModalContent()}
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

PayInterestModal.propTypes = {
  loan: PropTypes.shape({
    settlementCurrencyId: PropTypes.string.isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settledAt: PropTypes.number.isRequired,
    maturity: PropTypes.number.isRequired,
    balanceNote: PropTypes.shape({
      sharedSecret: PropTypes.string,
    }),
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
  payableInterest: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default PayInterestModal;
