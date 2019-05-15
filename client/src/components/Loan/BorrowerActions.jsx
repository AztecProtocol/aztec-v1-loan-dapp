import React from 'react';
import PropTypes from 'prop-types';
import {
  Block,
  Text,
} from '@aztec/guacamole-ui';
import loanStatus from '../../utils/loanStatus';
import ApproveViewRequestModal from '../ApproveViewRequestModal';
import WithdrawBalanceModal from '../WithdrawBalanceModal';
import PayInterestModal from '../PayInterestModal';
import RepayModal from '../RepayModal';
import PayableInterest from '../PayableInterest';
import ActionButton from './ActionButton';

const BorrowerActions = ({
  loan,
  notionalValue,
  balanceValue,
}) => {
  const {
    status,
  } = loan;

  switch (status) {
    case loanStatus('pending'):
    case loanStatus('awaiting_settlement'): {
      const {
        viewRequests,
      } = loan;
      if (!viewRequests || !viewRequests.length) {
        return (
          <Block
            padding="xs 0"
            align="center"
          >
            <Text
              text="Awaiting View Requests..."
              color="label"
            />
          </Block>
        );
      }

      const hasUnapprovedRequests = viewRequests.some(({
        sharedSecret,
      }) => !sharedSecret);
      return (
        <ApproveViewRequestModal
          loan={loan}
          notionalValue={notionalValue}
        >
          {({ onOpenModal }) => (
            <ActionButton
              key="button"
              theme={hasUnapprovedRequests ? 'primary' : 'secondary'}
              text={hasUnapprovedRequests ? 'Approve View Request' : 'See Approved Request'}
              onClick={onOpenModal}
            />
          )}
        </ApproveViewRequestModal>
      );
    }
    default:
  }

  let actionNode = null;
  const now = Date.now();
  const {
    maturity,
  } = loan;
  if (status === loanStatus('settled')
    || status === loanStatus('default')
  ) {
    actionNode = (
      <PayableInterest
        loan={loan}
        notionalValue={notionalValue}
      >
        {({
          totalInterest,
          payableInterest,
        }) => {
          const contentNodes = [];

          if (now < maturity) {
            const shouldDisableAction = notionalValue === null
              || balanceValue === null;

            if (status !== loanStatus('default')) {
              contentNodes.push(
                <WithdrawBalanceModal
                  key="withdraw-modal"
                  loan={loan}
                  notionalValue={notionalValue}
                  balanceValue={balanceValue || 0}
                  payableInterest={payableInterest}
                >
                  {({ onOpenModal }) => !shouldDisableAction && balanceValue > 0
                    ? (
                      <ActionButton
                        key="button"
                        theme="primary"
                        text="Withdraw Balance"
                        onClick={onOpenModal}
                      />
                    )
                    : null}
                </WithdrawBalanceModal>
              );
            }
            contentNodes.push(
              <PayInterestModal
                key="pay-interest-modal"
                loan={loan}
                notionalValue={notionalValue}
                balanceValue={balanceValue}
                payableInterest={payableInterest}
              >
                {({ onOpenModal }) => (
                  <ActionButton
                    key="button"
                    theme="primary"
                    text="Pay Interest"
                    onSubmit={onOpenModal}
                    disabled={shouldDisableAction}
                  />
                )}
              </PayInterestModal>
            );
          } else {
            contentNodes.push(
              <RepayModal
                key="repay-modal"
                loan={loan}
                notionalValue={notionalValue}
                balanceValue={balanceValue}
                totalInterest={totalInterest}
                payableInterest={payableInterest}
              >
                {({ onOpenModal }) => (
                  <ActionButton
                    key="button"
                    theme="primary"
                    text="Repay Loan"
                    onClick={onOpenModal}
                  />
                )}
              </RepayModal>
            );
          }

          return contentNodes;
        }}
      </PayableInterest>
    );
  }

  return actionNode;
};

BorrowerActions.propTypes = {
  loan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    viewRequests: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  notionalValue: PropTypes.number,
  balanceValue: PropTypes.number,
};

export default BorrowerActions;
