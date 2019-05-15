const loanFields = `
  id
  notional
  viewingKey
  interestRate
  interestPeriod
  settlementCurrencyId
  loanDuration
  borrower {
    address
    publicKey
  }
  lender {
    address
    publicKey
  }
  lenderAccess {
    lender {
      address
    }
    lenderPublicKey
    sharedSecret
  }
  balance {
    id
    access {
      user {
        address
      }
      sharedSecret
    }
    status
  }
  status
  createdAt
  settledAt
  repaidAt
  lastInterestWithdrawAt
`;

export default loanFields;
