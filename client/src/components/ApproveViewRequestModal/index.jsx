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
import AuthService from '../../helpers/AuthService';
import asyncForEach from '../../utils/asyncForEach';
import {
  decryptMessage,
} from '../../utils/crypto';
import {
  approveViewRequest,
} from '../../utils/loan';
import LoanModal from '../LoanModal';
import RequestCheckbox from './RequestCheckbox';

class ApproveViewRequestModal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      approvedRequests: [],
      unapprovedRequests: [],
      selectedLenders: [],
      isSubmitting: false,
      error: '',
    };
  }

  handleOpenModal = () => {
    const {
      loan,
    } = this.props;
    const {
      viewRequests,
    } = loan;

    this.setState({
      showModal: true,
      approvedRequests: viewRequests.filter(({ sharedSecret }) => sharedSecret),
      unapprovedRequests: viewRequests.filter(({ sharedSecret }) => !sharedSecret),
      selectedLenders: [],
    });
  };

  handleCloseModal = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      showModal: false,
    });
  };

  handleSelectViewRequest = (selected) => {
    const {
      isSubmitting,
      selectedLenders: prevSelectedLenders,
    } = this.state;
    if (isSubmitting) return;

    const selectedLenders = prevSelectedLenders.filter(address => address !== selected);
    if (selectedLenders.length === prevSelectedLenders.length) {
      selectedLenders.push(selected);
    }

    this.setState({
      selectedLenders,
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;
    this.setState({
      isSubmitting: true,
    });
    this.approveViewRequests();
  };

  approveViewRequests = async() => {
    try {
      const {
        selectedLenders,
        unapprovedRequests: prevUnapprovedRequests,
      } = this.state;
      const {
        loan,
      } = this.props;
      const {
        viewingKey: encryptedViewingKey,
        viewRequests,
      } = loan;
      const unapprovedLenders = new Set(selectedLenders);
      const approvedLenders = new Set();
      const privateKey = await AuthService.getPrivateKey();
      const viewingKey = await decryptMessage(privateKey, encryptedViewingKey);

      await asyncForEach(selectedLenders, async (selectedLender) => {
        const viewRequest = prevUnapprovedRequests.find(({
          lenderAddress,
        }) => lenderAddress === selectedLender);
        const approvedError = await this.approveViewRequest(viewRequest, viewingKey);
        if (!approvedError) {
          unapprovedLenders.delete(selectedLender);
          approvedLenders.add(selectedLender);
        }
      });

      this.setState({
        selectedLenders: [...unapprovedLenders],
        approvedRequests: viewRequests.filter(({
          lenderAddress,
          sharedSecret,
        }) => sharedSecret || approvedLenders.has(lenderAddress)),
        unapprovedRequests: viewRequests.filter(({
          lenderAddress,
          sharedSecret,
        }) => !sharedSecret && !approvedLenders.has(lenderAddress)),
        isSubmitting: false,
        error: '',
      });
    } catch (error) {
      errorLog(error);
      this.setState({
        isSubmitting: false,
        error,
      });
    }
  };

  async approveViewRequest(viewRequest, viewingKey) {
    const {
      loan,
    } = this.props;
    const {
      id: loanId,
    } = loan;
    const {
      lenderAddress,
      lenderPublicKey,
    } = viewRequest;

    try {
      await approveViewRequest({
        loanId,
        lenderAddress,
        lenderPublicKey,
        viewingKey,
      });
    } catch (error) {
      errorLog(error);
      return error;
    }

    return null;
  }

  renderModal() {
    const {
      showModal,
    } = this.state;
    if (!showModal) return null;

    const {
      isSubmitting,
      approvedRequests,
      unapprovedRequests,
      selectedLenders,
    } = this.state;
    const {
      loan,
      notionalValue,
    } = this.props;
    const hasUnapprovedRequests = unapprovedRequests.length > 0;

    return (
      <LoanModal
        key="modal"
        title="Approve View Requests"
        loan={loan}
        notionalValue={notionalValue}
        closeButtonText={hasUnapprovedRequests ? 'Cancel' : 'Close'}
        submitButtonText="Approve"
        onClose={this.handleCloseModal}
        onSubmit={hasUnapprovedRequests ? this.handleSubmit : null}
        isSubmitting={isSubmitting}
      >
        {unapprovedRequests.length > 0 && (
          <Block
            padding="m 0"
            align="left"
          >
            <Block
              left="m"
              bottom="l"
            >
              <Text
                text="Select requests to approve:"
                weight="semibold"
              />
            </Block>
            {unapprovedRequests.map(viewRequest => (
              <RequestCheckbox
                key={viewRequest.lenderAddress}
                viewRequest={viewRequest}
                selected={selectedLenders.some(lenderAddress => lenderAddress === viewRequest.lenderAddress)}
                onSelect={this.handleSelectViewRequest}
              />
            ))}
          </Block>
        )}
        {approvedRequests.length > 0 && (
          <Block
            padding="m 0"
            align="left"
          >
            <Block
              left="m"
              bottom="l"
            >
              <Text
                text="Approved requests:"
                weight="semibold"
              />
            </Block>
            {approvedRequests.map(viewRequest => (
              <RequestCheckbox
                key={viewRequest.lenderAddress}
                viewRequest={viewRequest}
                approved
              />
            ))}
          </Block>
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

ApproveViewRequestModal.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settlementCurrencyId: PropTypes.string.isRequired,
    viewingKey: PropTypes.string.isRequired,
    viewRequests: PropTypes.arrayOf(PropTypes.shape({
      lenderAddress: PropTypes.string.isRequired,
      lenderPublicKey: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default ApproveViewRequestModal;
