import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import NoteManager from '../../helpers/NoteManager';
import aztecIcon from '../../assets/aztec.png';
import Asset from './';

class ZKERC20Asset extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      balanceNotes,
    } = nextProps;
    const {
      balanceNotes: prevBalanceNotes,
    } = prevState.prevProps;
    if (balanceNotes === prevBalanceNotes
      || ((!balanceNotes || !balanceNotes.length) && prevBalanceNotes.length === 0)
    ) {
      return null;
    }

    return {
      isDecrypting: true,
      prevProps: {
        balanceNotes,
      },
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      isDecrypting: false,
      balance: 0,
      prevProps: {
        balanceNotes: [],
      },
    };
  }

  componentDidMount() {
    const {
      isDecrypting,
    } = this.state;
    if (isDecrypting) {
      this.calculateBalance();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      isDecrypting,
    } = this.state;
    const {
      isDecrypting: wasDecrypting,
    } = prevState;

    if (isDecrypting && !wasDecrypting) {
      this.calculateBalance();
    }
  }

  async calculateBalance() {
    const {
      balanceNotes,
      onFetchBalance,
    } = this.props;
    const validNotes = balanceNotes.filter(note => note.status === 'CREATED');
    const balance = await NoteManager.sum(validNotes);

    this.setState(
      {
        isDecrypting: false,
        balance,
      },
      onFetchBalance,
    );
  }

  render() {
    const {
      name,
      unit,
    } = this.props;
    const {
      isDecrypting,
      balance,
    } = this.state;

    return (
      <Asset
        img={aztecIcon}
        name={name}
        unit={unit}
        isDecrypting={isDecrypting}
        balance={balance}
      />
    );
  }
}

ZKERC20Asset.propTypes = {
  name: PropTypes.string,
  unit: PropTypes.string,
  balanceNotes: PropTypes.arrayOf(PropTypes.shape({
    noteHash: PropTypes.string.isRequired,
    sharedSecret: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['CREATED', 'DESTROYED']).isRequired,
  })),
  onFetchBalance: PropTypes.func,
};

ZKERC20Asset.defaultProps = {
  name: '',
  unit: '',
  onFetchBalance() {},
};

export default ZKERC20Asset;
