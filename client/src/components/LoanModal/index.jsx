import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  FlexBox,
  Row,
  Col,
  Block,
  Text,
  Icon,
  Button,
} from '@aztec/guacamole-ui';
import {
  systemDateFormat,
  displayedDateFormat,
} from '../../config/datetime';
import {
  format,
  unit as currencyUnit,
} from '../../utils/currency';
import Modal from '../Modal';
import LoanTermCol from '../Loan/LoanTermCol';
import EncryptedValueLoader from '../EncryptedValueLoader';
import './LoanModal.scss';

const LoanModal = ({
  role,
  title,
  iconName,
  loan,
  notionalValue,
  children,
  submitButtonText,
  closeButtonText,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const {
    interestRate,
    interestPeriod,
    loanDuration,
    maturity,
    settlementCurrencyId,
  } = loan;
  const currency = currencyUnit(settlementCurrencyId);

  let notionalNode;
  if (notionalValue === null) {
    notionalNode = (
      <EncryptedValueLoader
        size="m"
        background="primary-lighter"
      />
    );
  } else if (notionalValue > 0) {
    notionalNode = (
      <Text
        text={format(notionalValue)}
        size="l"
        weight="semibold"
      />
    );
  } else {
    notionalNode = (
      <Icon
        name="locked"
        size="l"
      />
    );
  }

  return (
    <Modal
      title={title}
      iconName={iconName}
    >
      <Block
        padding="0 l"
        align="center"
      >
        <Block
          padding="l 0 xl"
        >
          <FlexBox
            align="center"
            valign="center"
          >
            {notionalNode}
            {currency && (
              <Block left="s">
                <Text
                  text={` (${currency})`}
                  size="s"
                />
              </Block>
            )}
          </FlexBox>
        </Block>
        <Block
          hasBorderTop
          hasBorderBottom
        >
          <Row>
            <LoanTermCol
              className="LoanModal_loan-item-col"
              column={4}
              padding="m 0"
              label="Interest Rate"
              text={`${interestRate} %`}
            />
            <LoanTermCol
              className="LoanModal_loan-item-col"
              column={4}
              padding="m 0"
              label="Interest Period"
              text={`${interestPeriod} day${interestPeriod === 1 ? '' : 's'}`}
            />
            {!maturity && (
              <LoanTermCol
                className="LoanModal_loan-item-col"
                column={4}
                padding="m 0"
                label="Loan Duration"
                text={`${loanDuration} day${loanDuration === 1 ? '' : 's'}`}
              />
            )}
            {!!maturity && (
              <LoanTermCol
                className="LoanModal_loan-item-col"
                column={4}
                padding="m 0"
                label="Maturity"
                text={moment(maturity, systemDateFormat).format(displayedDateFormat)}
              />
            )}
          </Row>
        </Block>
        {children && (
          <Block top="m">
            {children}
          </Block>
        )}
        {(onClose || onSubmit) && (
          <Block padding="xl 0">
            <Row align="center">
              {onClose && (
                <Col column={6}>
                  <Button
                    theme="secondary"
                    text={closeButtonText}
                    onSubmit={onClose}
                    disabled={isSubmitting}
                    expand
                  />
                </Col>
              )}
              {onSubmit && (
                <Col column={6}>
                  <Button
                    theme="primary"
                    text={submitButtonText}
                    onSubmit={onSubmit}
                    isLoading={isSubmitting}
                    expand
                  />
                </Col>
              )}
            </Row>
          </Block>
        )}
      </Block>
    </Modal>
  );
};

LoanModal.propTypes = {
  title: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  loan: PropTypes.shape({
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    maturity: PropTypes.number,
    settlementCurrencyId: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  children: PropTypes.node,
  footer: PropTypes.node,
  submitButtonText: PropTypes.string,
  closeButtonText: PropTypes.string,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
};

LoanModal.defaultProps = {
  children: null,
  iconName: 'security',
  submitButtonText: 'Submit',
  closeButtonText: 'Close',
  notionalValue: null,
  onClose: null,
  onSubmit: null,
  isSubmitting: false,
};

export default LoanModal;
