import {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  calculateTotalInterest,
  calculatePayableInterest,
  calculateInterestDuration,
} from '../../utils/loan';

class PayableInterest extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      loan,
      notionalValue,
      roundingMethod,
    } = nextProps;
    const {
      loan: prevLoan,
      notionalValue: prevNotionalValue,
    } = prevState.prevProps;
    if (notionalValue === prevNotionalValue
      && loan === prevLoan
    ) {
      return null;
    }

    const {
      interestRate,
      interestPeriod,
      loanDuration,
      settledAt,
      lastInterestWithdrawAt,
      maturity,
    } = loan;

    const totalInterest = calculateTotalInterest({
      notional: notionalValue,
      interestRate,
      interestPeriod,
      loanDuration,
    });

    const payableInterest = calculatePayableInterest({
      totalInterest,
      settledAt,
      lastWithdrawAt: lastInterestWithdrawAt,
      maturity,
      roundingMethod,
    });

    const msPerInterest = calculateInterestDuration({
      amount: 1,
      totalInterest,
      settledAt,
      maturity,
      timeUnit: 'ms',
    });

    return {
      totalInterest,
      payableInterest,
      msPerInterest,
      prevProps: {
        loan,
        notionalValue,
      },
    };
  }

  constructor(props) {
    super(props);

    this.updateReq = null;

    this.state = {
      totalInterest: 0,
      payableInterest: 0,
      msPerInterest: 0,
      prevProps: {
        loan: {},
        notionalValue: 0,
      },
    };
  }

  componentDidMount() {
    const {
      msPerInterest,
    } = this.state;

    if (msPerInterest > 0) {
      this.startRefreshingValue();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      msPerInterest,
    } = this.state;
    const {
      msPerInterest: prevMsPerInterest,
    } = prevState;

    if (msPerInterest > 0 && msPerInterest !== prevMsPerInterest) {
      this.startRefreshingValue();
    }
  }

  componentWillUnmount() {
    clearInterval(this.updateReq);
  }

  startRefreshingValue() {
    const {
      msPerInterest,
    } = this.state;
    const {
      minRefreshTime,
    } = this.props;

    clearInterval(this.updateReq);

    this.updateReq = setInterval(
      this.updatePayableInterest,
      Math.max(msPerInterest, minRefreshTime),
    );
  }

  updatePayableInterest = () => {
    const {
      loan,
      roundingMethod,
    } = this.props;
    const {
      settledAt,
      lastInterestWithdrawAt,
      maturity,
    } = loan;
    const {
      totalInterest,
      payableInterest: prevPayableInterest,
    } = this.state;
    const payableInterest = calculatePayableInterest({
      totalInterest,
      settledAt,
      lastWithdrawAt: lastInterestWithdrawAt,
      maturity,
      roundingMethod,
    });

    if (payableInterest !== prevPayableInterest) {
      this.setState({
        payableInterest,
      });
    }
  };

  render() {
    const {
      children,
    } = this.props;
    const {
      totalInterest,
      payableInterest,
    } = this.state;

    return children({
      totalInterest,
      payableInterest,
    });
  }
}

PayableInterest.propTypes = {
  loan: PropTypes.shape({
    interestRate: PropTypes.number.isRequired,
    interestPeriod: PropTypes.number.isRequired,
    loanDuration: PropTypes.number.isRequired,
    settledAt: PropTypes.number.isRequired,
    lastInterestWithdrawAt: PropTypes.number,
    maturity: PropTypes.number.isRequired,
  }).isRequired,
  notionalValue: PropTypes.number,
  minRefreshTime: PropTypes.number,
  roundingMethod: PropTypes.oneOf([
    '',
    'floor',
    'ceil',
    'round',
  ]),
  children: PropTypes.func.isRequired,
};

PayableInterest.defaultProps = {
  notionalValue: 0,
  minRefreshTime: 1000, // ms
  roundingMethod: 'floor',
};

export default PayableInterest;
