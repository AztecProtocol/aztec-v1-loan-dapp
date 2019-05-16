const loanFields = `
  id
  notional {
    id
    access {
      user {
        address
      }
      sharedSecret
    }
  }
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
  viewRequests {
    address
    publicKey
  }
  lenderAccess {
    user {
      address
    }
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
