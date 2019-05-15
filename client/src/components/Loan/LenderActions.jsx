import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import loanStatus from '../../utils/loanStatus';
import ViewRequestModal from '../ViewRequestModal';
import SettleLoanModal from '../SettleLoanModal';
import WithdrawInterestModal from '../WithdrawInterestModal';
import MarkDefaultModal from '../MarkDefaultModal';
import PayableInterest from '../PayableInterest';
import ActionButton from './ActionButton';

const LenderActions = ({
  loan,
  notionalValue,
  balanceValue,
}) => {
  const {
    status,
  } = loan;

  switch (status) {
    case loanStatus('pending'):
    case loanStatus('awaiting_approval'): {
      return (
        <ViewRequestModal
          loan={loan}
          notionalValue={notionalValue}
        >
          {({
            onOpenModal,
          }) => {
            if (status === loanStatus('pending')) {
              return (
                <ActionButton
                  key="button"
                  text="Submit View Request"
                  onClick={onOpenModal}
                />
              );
            }
            return (
              <Block
                key="text"
                padding="xs 0"
                align="center"
              >
                <Text
                  text="Awaiting Approval..."
                  color="label"
                />
              </Block>
            );
          }}
        </ViewRequestModal>
      );
    }
    default:
  }

  const actionNodes = [];

  if (status !== loanStatus('default')) {
    actionNodes.push(
      <SettleLoanModal
        key="settle-modal"
        loan={loan}
        notionalValue={notionalValue}
      >
        {({
          onOpenModal,
        }) => (status === loanStatus('awaiting_settlement')
          && (
            <ActionButton
              key="button"
              text="Settle Loan"
              onClick={onOpenModal}
            />
          ))
          || null}
      </SettleLoanModal>,
    );
  }

  if (status === loanStatus('settled')
    || status === loanStatus('default')
  ) {
    actionNodes.push(
      <PayableInterest
        key="settled-modal"
        loan={loan}
        notionalValue={notionalValue}
      >
        {({
          totalInterest,
          payableInterest,
        }) => {
          const contentNodes = [
            <WithdrawInterestModal
              key="withdraw-modal"
              loan={loan}
              notionalValue={notionalValue}
              balanceValue={balanceValue}
              totalInterest={totalInterest}
              payableInterest={payableInterest}
            >
              {({
                onOpenModal,
              }) => ((status === loanStatus('settled') || payableInterest > 0)
                && (
                  <ActionButton
                    key="button"
                    theme="primary"
                    text="Withdraw Interest"
                    onSubmit={onOpenModal}
                    disabled={payableInterest <= 0}
                  />
                ))
                || null}
            </WithdrawInterestModal>,
          ];

          if (balanceValue !== null
            && payableInterest > balanceValue
          ) {
            contentNodes.push(
              <MarkDefaultModal
                key="defaulting-modal"
                loan={loan}
                notionalValue={notionalValue}
                payableInterest={payableInterest}
                totalInterest={totalInterest}
                balanceValue={balanceValue}
              >
                {({
                  onOpenModal,
                }) => (status === loanStatus('settled')
                  && (
                    <ActionButton
                      key="button"
                      theme="primary"
                      text="Mark Loan as Default"
                      onClick={onOpenModal}
                    />
                  ))
                  || null}
              </MarkDefaultModal>
            );
          }

          return contentNodes;
        }}
      </PayableInterest>,
    );
  }

  return actionNodes;
};

LenderActions.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

export default LenderActions;
