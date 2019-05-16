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
  settleLoan,
} from '../../utils/loan';
import {
  makeFormat,
} from '../../utils/currency';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import Transferring from '../Transferring';

const ensureProcessingEffect = fn => setTimeout(() => {
  fn();
}, randomInt(1000, 2000));

class SettleLoanModal extends PureComponent {
  constructor(props) {
    super(props);

    this.steps = [
      'warning',
      'approve',
      'deposit-prompt',
      'deposit',
      'approve-failed',
      'settle',
      'settle-failed',
      'settle-success',
    ];

    this.stepsRequiredProcessing = [
      'approve',
      'deposit',
      'settle',
    ];

    const {
      loan,
    } = props;
    const {
      settlementCurrencyId,
    } = loan;
    this.format = makeFormat(settlementCurrencyId);

    this.state = {
      step: this.steps[0],
      showModal: false,
      isSubmitting: false,
      error: '',
    };
  }

  handleOpenModal = () => {
    this.setState({
      step: this.steps[0],
      showModal: true,
      isSubmitting: false,
      error: '',
    });
  };

  handleCloseModal = () => {
    this.setState({
      showModal: false,
    });
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
      case 'settle':
        this.settleLoan();
        break;
      default:
    }
  }

  async approveAmount() {
    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;
    let approvedAmount = 0;

    try {
      approvedAmount = await approveSpendERC20({
        amount: +notionalValue,
        currencyId: settlementCurrencyId,
      });
    } catch (error) {
      errorLog(error);
    }

    if (approvedAmount === +notionalValue) {
      this.goToStep('settle');
    } else if (process.env.NODE_ENV !== 'production') {
      this.goToStep('deposit-prompt');
    } else {
      this.goToStep('approve-failed');
    }
  }

  async depositAmount() {
    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      settlementCurrencyId,
    } = loan;

    try {
      await deposit({
        amount: +notionalValue,
        currencyId: settlementCurrencyId,
      });

      this.goToStep('approve');
    } catch (error) {
      errorLog(error);
    }
  }

  async settleLoan() {
    const {
      loan,
      notionalValue,
    } = this.props;
    const {
      address: loanAddress,
      settlementCurrencyId,
      borrower,
      notionalNote,
    } = loan;
    const {
      sharedSecret,
    } = notionalNote;
    const amount = +notionalValue;

    try {
      const settledAmount = await settleLoan({
        loanAddress,
        amount,
        currencyId: settlementCurrencyId,
        borrower,
        sharedSecret,
      });

      if (settledAmount !== amount) {
        this.goToStep('settle-failed');
        return;
      }

      this.goToStep('settle-success');
    } catch (error) {
      errorLog(error);
      this.goToStep('settle-failed');
    }
  }

  renderModalContent() {
    const {
      notionalValue,
    } = this.props;
    const {
      step,
    } = this.state;

    if (notionalValue === '') {
      return null;
    }

    switch (step) {
      case 'warning':
        return (
          <Message
            type="warn"
            message="By pressing the settle button below, you agree to be bound into the loan agreement."
          />
        );
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
                text="You don't have enough balance to convert to settlement notes. For demonstration purposes, here are some free tokens:"
                size="xs"
              />
            </Block>
            <Block padding="s">
              <Text
                text={this.format(notionalValue)}
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
            description={`Sending ${this.format(notionalValue, { showUnit: true })} to your account`}
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
            message="You don't have enough balance to settlement the loan."
          />
        );
      case 'settle':
        return (
          <Transferring
            description="Settling"
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
      case 'settle-success':
        return (
          <Message
            type="success"
            message={`Loan Settled Successfully! Amount: ${this.format(notionalValue, { showUnit: true })}`}
          />
        );
      case 'settle-failed':
        return (
          <Message
            type="error"
            message="Something went wrong while settling the loan. Please try again."
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
      case 'warning':
        submitButton = {
          text: 'Settle',
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
      case 'settle-success':
        closeButton = {
          text: 'Close',
          onClick: this.handleCloseModal,
        };
        break;
      case 'settle-failed':
        submitButton = {
          text: 'Settle',
          onClick: () => this.goToStep('settle'),
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
        title="Settle Loan"
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

SettleLoanModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    borrower: PropTypes.shape({
      address: PropTypes.string.isRequired,
      publicKey: PropTypes.string.isRequired,
    }).isRequired,
    notionalNote: PropTypes.shape({
      sharedSecret: PropTypes.string.isRequired,
    }).isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settledAt: PropTypes.number.isRequired,
    lastWithdrawAt: PropTypes.number,
    settlementCurrencyId: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default SettleLoanModal;
