import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Text,
} from '@aztec/guacamole-ui';
import {
  errorLog,
} from '../../utils/log';
import {
  markAsDefault,
} from '../../utils/loan';
import {
  makeFormat,
} from '../../utils/currency';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';

class MarkDefaultModal extends PureComponent {
  constructor(props) {
    super(props);

    const {
      loan,
    } = props;
    const {
      settlementCurrencyId,
    } = loan;
    this.format = makeFormat(settlementCurrencyId);

    this.state = {
      showModal: false,
      isSubmitting: false,
      justSubmmited: false,
      error: '',
    };
  }

  handleOpenModal = () => {
    this.setState({
      showModal: true,
    });
  };

  handleCloseModal = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      showModal: false,
      justSubmmited: false,
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      isSubmitting: true,
    });
    this.markAsDefault();
  };

  markAsDefault = async() => {
    const {
      loan,
      totalInterest,
      payableInterest,
    } = this.props;
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
      await markAsDefault({
        payableInterest,
        loanAddress: loan.address,
        interestRate,
        interestPeriod,
        totalInterest,
        borrower,
        settledAt,
        maturity,
        notionalSharedSecret: viewRequest.sharedSecret,
        balanceSharedSecret: balance.sharedSecret,
      });

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

  renderSuccessModal() {
    const {
      loan,
      notionalValue,
    } = this.props;

    return (
      <LoanModal
        key="modal"
        title="Mark Loan As Default"
        loan={loan}
        notionalValue={notionalValue}
        onClose={this.handleCloseModal}
      >
        <Message
          type="success"
          message="This loan has been marked as default."
        />
      </LoanModal>
    );
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
      loan,
      notionalValue,
      balanceValue,
      payableInterest,
    } = this.props;
    const {
      isSubmitting,
    } = this.state;
    const overdueInterest = payableInterest - balanceValue;

    return (
      <LoanModal
        key="modal"
        title="Mark Loan As Default"
        loan={loan}
        notionalValue={notionalValue}
        submitButtonText="Mark As Default"
        closeButtonText="Cancel"
        onClose={this.handleCloseModal}
        onSubmit={this.handleSubmit}
        isSubmitting={isSubmitting}
      >
        <InputRow
          label="Account Balance:"
          value={this.format(balanceValue)}
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

MarkDefaultModal.propTypes = {
  loan: PropTypes.shape({
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    maturity: PropTypes.number,
    settlementCurrencyId: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  payableInterest: PropTypes.number,
  totalInterest: PropTypes.number,
  balanceValue: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default MarkDefaultModal;
