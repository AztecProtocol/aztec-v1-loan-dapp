import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  FlexBox,
  Block,
} from '@aztec/guacamole-ui';
import NoteManager from '../../helpers/NoteManager';
import aztecIcon from '../../assets/aztec-white.svg';
import EncryptedValue from '../EncryptedValue';
import './NoteBalanceSummary.scss';

class Summary extends PureComponent {
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
    } = this.props;
    const validNotes = balanceNotes.filter(note => note.status === 'CREATED');
    const balance = await NoteManager.sum(validNotes);

    this.setState({
      isDecrypting: false,
      balance,
    });
  }

  render() {;
    const {
      isDecrypting,
      balance,
    } = this.state;

    const valueNode = (
      <EncryptedValue
        value={balance}
        loaderColor="white"
        background="primary"
        size={isDecrypting ? 'xxs' : 'xs'}
        isDecrypting={isDecrypting}
      />
    );

    return (
      <FlexBox
        className="lh0"
        valign="center"
      >
        <Block
          className={!balance && !isDecrypting ? 'NoteBalanceSummary_empty' : ''}
          right="s"
        >
          {valueNode}
        </Block>
        {!isDecrypting && (
          <img
            className="NoteBalanceSummary_icon"
            src={aztecIcon}
            alt=""
          />
        )}
      </FlexBox>
    );
  }
}

Summary.propTypes = {
  balanceNotes: PropTypes.arrayOf(PropTypes.shape({
    noteHash: PropTypes.string.isRequired,
    sharedSecret: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['CREATED', 'DESTROYED']).isRequired,
  })),
};

Summary.defaultProps = {
  balanceNotes: [],
};

export default Summary;
