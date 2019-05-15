import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  MaskedNumberInput,
  Block,
  Button,
} from '@aztec/guacamole-ui';
import {
  deposit,
} from '../../utils/erc20';
import {
  format,
} from '../../utils/currency';
import Modal from '../Modal';
import Message from '../Modal/Message';
import InputRow from '../Modal/InputRow';

class DepositModal extends PureComponent {
  constructor(props) {
    super(props);

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
    this.setState(
      {
        amount: 0,
        showModal: true,
        justSubmmited: false,
        error: '',
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

  handleChangeDepositAmount = (amount) => {
    if (this.state.isSubmitting) return;
    this.setState({
      amount,
    });
  };

  handleSubmit = () => {
    if (this.state.isSubmitting) return;

    const {
      justSubmmited,
    } = this.state;
    if (justSubmmited) {
      this.setState(
        {
          amount: 0,
          justSubmmited: false,
        },
        this.handleFocusInput,
      );
      return;
    }

    this.setState(
      {
        isSubmitting: true,
      },
      this.deposit,
    );
  };

  deposit = async() => {
    const {
      currencyId,
      onDepositSuccess,
    } = this.props;
    const {
      amount,
    } = this.state;

    try {
      await deposit({
        amount,
        currencyId,
      });

      this.setState(
        {
          justSubmmited: true,
          isSubmitting: false,
          error: '',
        },
        onDepositSuccess,
      );
    } catch (error) {
      this.setState({
        isSubmitting: false,
        error,
      });
    }
  };

  renderModal() {
    const {
      showModal,
      amount,
      justSubmmited,
      isSubmitting,
    } = this.state;

    if (!showModal) {
      return null;
    }

    const {
      title,
      currencyId,
      balanceValue,
    } = this.props;

    return (
      <Modal
        key={`deposit-modal-${currencyId}`}
        title={title}
      >
        <Block padding="0 l">
          <Block top="l">
            {!justSubmmited && (
              <div>
                <InputRow
                  label="Current Balance:"
                  value={format(balanceValue, currencyId)}
                />
                <InputRow
                  label="Deposit Amount:"
                >
                  <MaskedNumberInput
                    setInputRef={this.setInputRef}
                    size="l"
                    value={amount}
                    onChange={this.handleChangeDepositAmount}
                  />
                </InputRow>
              </div>
            )}
            {justSubmmited && (
              <Message
                type="success"
                message={`${format(amount, currencyId, { showUnit: true })} saved successfully!`}
              />
            )}
          </Block>
          <Block padding="xl 0">
            <Row align="center">
              <Col column={6}>
                <Button
                  theme="primary"
                  text={justSubmmited ? 'Close' : 'Cancel'}
                  onSubmit={this.handleCloseModal}
                  disabled={isSubmitting}
                  expand
                />
              </Col>
              <Col column={6}>
                <Button
                  theme="secondary"
                  text={justSubmmited ? 'Make Another Deposit' : 'Deposit'}
                  onSubmit={this.handleSubmit}
                  isLoading={isSubmitting}
                  expand
                />
              </Col>
            </Row>
          </Block>
        </Block>
      </Modal>
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

DepositModal.propTypes = {
  title: PropTypes.string.isRequired,
  currencyId: PropTypes.string.isRequired,
  balanceValue: PropTypes.number,
  children: PropTypes.func.isRequired,
  onDepositSuccess: PropTypes.func,
};

DepositModal.defaultProps = {
  onDepositSuccess() {},
};

export default DepositModal;
