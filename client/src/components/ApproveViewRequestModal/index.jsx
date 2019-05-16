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
      lenderAccess,
    } = loan;
    const approvedRequests = lenderAccess.map(({ user }) => ({
      address: user.address,
    }));
    const unapprovedRequests = viewRequests.filter(({ address }) =>
      !approvedRequests.some(approved => approved.address === address));

    this.setState({
      showModal: true,
      approvedRequests,
      unapprovedRequests,
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
        approvedRequests,
        unapprovedRequests,
      } = this.state;
      const {
        loan,
      } = this.props;
      const {
        notionalNote: {
          sharedSecret,
        },
      } = loan;
      const unapprovedLenders = new Set(selectedLenders);
      const approvedLenders = new Set();
      const privateKey = await AuthService.getPrivateKey();
      const viewingKey = await decryptMessage(privateKey, sharedSecret);

      await asyncForEach(selectedLenders, async (address) => {
        const viewRequest = unapprovedRequests.find(request => request.address === address);
        const approvedError = await this.approveViewRequest(viewRequest, viewingKey);
        if (!approvedError) {
          unapprovedLenders.delete(address);
          approvedLenders.add(address);
        }
      });

      this.setState({
        selectedLenders: [...unapprovedLenders],
        approvedRequests: [
          ...approvedRequests,
          ...[...approvedLenders].map(address => ({ address })),
        ],
        unapprovedRequests: unapprovedRequests.filter(({ address }) => !approvedLenders.has(address)),
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
      notionalNote,
    } = loan;
    const {
      id: notionalNoteHash,
    } = notionalNote;
    const {
      address: lenderAddress,
      publicKey: lenderPublicKey,
    } = viewRequest;

    try {
      await approveViewRequest({
        loanId,
        notionalNoteHash,
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
                key={viewRequest.address}
                viewRequest={viewRequest}
                selected={selectedLenders.some(address => address === viewRequest.address)}
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
                key={viewRequest.address}
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
    notionalNote: PropTypes.shape({
      sharedSecret: PropTypes.string.isRequired,
    }).isRequired,
    viewRequests: PropTypes.arrayOf(PropTypes.shape({
      address: PropTypes.string.isRequired,
      publicKey: PropTypes.string.isRequired,
    })).isRequired,
    lenderAccess: PropTypes.arrayOf(PropTypes.shape({
      user: PropTypes.shape({
        address: PropTypes.string.isRequired,
      }).isRequired,
    })).isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  children: PropTypes.func.isRequired,
};

export default ApproveViewRequestModal;
