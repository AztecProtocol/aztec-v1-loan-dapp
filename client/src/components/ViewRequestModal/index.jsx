import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  submitViewRequest,
} from '../../utils/loan';
import LoanModal from '../LoanModal';
import Message from '../Modal/Message';

class ViewRequestModal extends PureComponent {
  constructor(props) {
    super(props);

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

    this.setState(
      {
        isSubmitting: true,
      },
      this.submitViewRequest,
    );
  };

  async submitViewRequest() {
    const {
      loan,
    } = this.props;
    const {
      id: loanId,
    } = loan;

    try {
      await submitViewRequest({
        loanId,
      });

      this.setState({
        justSubmmited: true,
        isSubmitting: false,
        error: '',
      });
    } catch (error) {
      this.setState({
        isSubmitting: false,
        error,
      });
    }
  }

  renderSuccessModal() {
    const {
      loan,
    } = this.props;

    return (
      <LoanModal
        key="modal"
        title="Submit View Request Successfully"
        loan={loan}
        notionalValue={0}
        onClose={this.handleCloseModal}
      >
        <Message
          type="success"
          message="View request sent! You can see the notional once the borrower approves your view reqeust."
        />
      </LoanModal>
    );
  }

  renderModal() {
    const {
      showModal,
    } = this.state;
    if (!showModal) return null;

    const {
      loan,
    } = this.props;
    const {
      isSubmitting,
      justSubmmited,
    } = this.state;

    if (justSubmmited) {
      return this.renderSuccessModal();
    }

    return (
      <LoanModal
        key="modal"
        title="Submit View Request"
        loan={loan}
        notionalValue={0}
        closeButtonText="Cancel"
        onClose={this.handleCloseModal}
        onSubmit={this.handleSubmit}
        isSubmitting={isSubmitting}
      />
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

ViewRequestModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settlementCurrencyId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.func.isRequired,
};

export default ViewRequestModal;
