import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Block,
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
  repay,
} from '../../utils/loan';
import {
  makeFormat,
} from '../../utils/currency';
import Transferring from '../Transferring';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';

const ensureProcessingEffect = fn => setTimeout(() => {
  fn();
}, randomInt(1000, 2000));

class RepayModal extends PureComponent {
  constructor(props) {
    super(props);

    this.steps = [
      'confirm',
      'approve',
      'deposit-prompt',
      'deposit',
      'approve-failed',
      'payment-interest',
      'payment',
      'payment-failed',
      'payment-success',
    ];

    this.stepsRequiredProcessing = [
      'approve',
      'deposit',
      'payment-interest',
      'payment',
    ];

    const {
      loan,
    } = props;
    const {
      settlementCurrencyId,
    } = loan;
    this.format = makeFormat(settlementCurrencyId);

    this.state = {
      step: '',
      showModal: false,
      isSubmitting: false,
      error: '',
    };
  }

  getTotalPayableAmount() {
    const {
      notionalValue,
      payableInterest,
      balanceValue,
    } = this.props;

    return Math.max(
      0,
      (notionalValue + payableInterest) - balanceValue,
    );
  }

  getOwedInterest() {
    const {
      payableInterest,
      balanceValue,
    } = this.props;

    return Math.max(
      0,
      payableInterest - balanceValue,
    );
  }

  handleOpenModal = () => {
    this.setState({
      step: this.steps[0],
      showModal: true,
    });
  };

  handleCloseModal = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      showModal: false,
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      isSubmitting: true,
    });
    this.repay();
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
      case 'payment-interest':
        this.payInterest();
        break;
      case 'payment':
        this.repay();
        break;
      default:
    }
  }

  async approveAmount() {
    const {
      loan,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;
    const amount = this.getTotalPayableAmount();
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
      const owedInterest = this.getOwedInterest();
      if (owedInterest > 0) {
        this.goToStep('payment-interest');
      } else {
        this.goToStep('payment');
      }
    } else if (process.env.NODE_ENV !== 'production') {
      this.goToStep('deposit-prompt');
    } else {
      this.goToStep('approve-failed');
    }
  }

  async depositAmount() {
    const {
      loan,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;
    const amount = this.getTotalPayableAmount();

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
    const owedInterest = this.getOwedInterest();

    try {
      const paidAmount = await payInterest({
        loanAddress,
        amount: owedInterest,
        currencyId: settlementCurrencyId,
        balanceSharedSecret: balanceNote.sharedSecret,
        lender,
      });

      if (paidAmount !== owedInterest) {
        this.goToStep('payment-failed');
        return;
      }

      this.goToStep('payment');
    } catch (error) {
      errorLog(error);
      this.goToStep('payment-failed');
    }
  };

  repay = async() => {
    const {
      loan,
      totalInterest,
      payableInterest,
    } = this.props;
    const {
      address: loanAddress,
      notionalNote: {
        sharedSecret: notionalSharedSecret,
      },
      settlementCurrencyId,
      interestRate,
      interestPeriod,
      settledAt,
      maturity,
      lender,
      balanceNote,
    } = loan;

    try {
      await repay({
        loanAddress,
        payableInterest,
        notionalSharedSecret,
        balanceSharedSecret: balanceNote.sharedSecret,
        interestRate,
        interestPeriod,
        totalInterest,
        currencyId: settlementCurrencyId,
        settledAt,
        maturity,
        lender,
      });

      // const expectedAmount = this.getTotalPayableAmount();
      // if (repaidAmount !== expectedAmount) {
      //   this.goToStep('payment-failed');
      //   return;
      // }

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
    if (notionalValue === null) {
      return null;
    }

    const {
      step,
    } = this.state;
    const {
      balanceValue,
      payableInterest,
    } = this.props;
    const overdueAmount = Math.max(
      0,
      (notionalValue + payableInterest) - balanceValue,
    );

    switch (step) {
      case 'confirm': {
        return (
          <div>
            <InputRow
              label="Loan Notional:"
              value={this.format(notionalValue)}
            />
            <InputRow
              label="Owed Interest:"
              value={this.format(payableInterest)}
            />
            <InputRow
              label="Account Balance:"
              value={this.format(balanceValue)}
            />
            <InputRow
              label="Total amount to pay:"
              value={(
                <Text
                  text={this.format(overdueAmount)}
                  weight="bold"
                />
              )}
            />
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
                text={this.format(overdueAmount)}
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
            description={`Sending ${this.format(overdueAmount, { showUnit: true })} to your account`}
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
      case 'payment-interest':
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
      case 'payment':
        return (
          <Transferring
            description="Repaying Loan"
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
            message={`Loan repaid successfully! Amount paid: ${this.format(overdueAmount, { showUnit: true })}`}
          />
        );
      case 'payment-failed':
        return (
          <Message
            type="error"
            message="Something went wrong while repaying the loan. Please try again later."
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
          text: 'Repay',
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
      isSubmitting,
    } = this.state;

    if (!showModal) return null;

    const {
      loan,
      notionalValue,
    } = this.props;

    const {
      submitButton,
      closeButton,
    } = this.getButtonConfigs();

    return (
      <LoanModal
        key="modal"
        title="Repay Loan"
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

RepayModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    lender: PropTypes.shape({
      address: PropTypes.string.isRequired,
      publicKey: PropTypes.string.isRequired,
    }).isRequired,
    notionalNote: PropTypes.shape({
      sharedSecret: PropTypes.string.isRequired,
    }).isRequired,
    balanceNote: PropTypes.shape({
      sharedSecret: PropTypes.string,
    }),
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settledAt: PropTypes.number.isRequired,
    lastWithdrawAt: PropTypes.number,
    settlementCurrencyId: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
  payableInterest: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default RepayModal;
