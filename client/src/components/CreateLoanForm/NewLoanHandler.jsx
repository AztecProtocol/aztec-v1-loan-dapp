import {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';

class NewLoanHandler extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  componentDidUpdate(prevProps) {
    const {
      expectedNotional,
      newLoan,
      onReceiveNewLoan,
    } = this.props;
    const {
      newLoan: prevLoan,
    } = prevProps;
    if (newLoan && newLoan !== prevLoan) {
      const {
        id,
        notional,
      } = newLoan;
      if (notional.id === expectedNotional) {
        onReceiveNewLoan(id);
      }
    }
  }

  render() {
    return null;
  }
}

NewLoanHandler.propTypes = {
  expectedNotional: PropTypes.string,
  newLoan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    notional: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }),
  onReceiveNewLoan: PropTypes.func,
};

NewLoanHandler.defaultProps = {
  expectedNotional: '',
  newLoan: null,
};

export default NewLoanHandler;
