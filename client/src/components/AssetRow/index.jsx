import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Block,
  Button,
} from '@aztec/guacamole-ui';
import {
  getBalance as getERC20Balance,
} from '../../utils/erc20';
import Asset from '../Asset';
import ZKERC20Asset from '../Asset/ZKERC20Asset';
import DepositModal from '../DepositModal';

class AssetRow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      balance: 0,
    };
  }

  componentDidMount() {
    this.fetchLatestBalance();
  }

  async fetchLatestBalance() {
    const {
      currencyId,
    } = this.props;
    const {
      balance: prevBalance,
    } = this.state;
    const balance = await getERC20Balance({
      currencyId,
    });
    if (balance !== prevBalance) {
      this.setState({
        balance,
      });
    }
  }

  handleDepositSuccess = () => {
    const {
      onDepositSuccess,
    } = this.props;
    this.fetchLatestBalance();
    onDepositSuccess();
  };

  render() {
    const {
      currencyId,
      name,
      unit,
      img,
      balanceNotes,
    } = this.props;
    const {
      balance,
    } = this.state;

    return (
      <Block
        padding={{ s: 's', xxs: 'm' }}
        background="white"
        borderRadius="xs"
        layer={1}
      >
        <Row
          margin="none"
          valign="center"
        >
          <Col
            column={{ s: 5, xxs: 12 }}
            margin="none"
          >
            <Block
              padding="m"
            >
              <Asset
                img={img}
                name={name}
                unit={unit}
                balance={balance}
              />
            </Block>
          </Col>
          <Col
            column={{ s: 5, xxs: 12 }}
            margin="none"
          >
            <Block
              padding="m"
            >
              <ZKERC20Asset
                name=""
                unit=""
                balanceNotes={balanceNotes}
              />
            </Block>
          </Col>
          <Col
            column={{ s: 2, xxs: 12 }}
            align={{ s: 'right', xxs: 'center' }}
            margin="none"
          >
            <Block
              padding="m"
            >
              <DepositModal
                title={`Deposit ${name}`}
                currencyId={currencyId}
                balanceValue={balance}
                onDepositSuccess={this.handleDepositSuccess}
              >
                {({ onOpenModal }) => (
                  <Button
                    key="deposit-button"
                    theme="primary"
                    text="Deposit"
                    onClick={onOpenModal}
                    expand={{ s: false, xxs: true }}
                    outlined
                  />
                )}
              </DepositModal>
            </Block>
          </Col>
        </Row>
      </Block>
    );
  }
}

AssetRow.propTypes = {
  currencyId: PropTypes.string.isRequired,
  img: PropTypes.string,
  name: PropTypes.string,
  unit: PropTypes.string,
  balanceNotes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDepositSuccess: PropTypes.func,
};

AssetRow.defaultProps = {
  img: '',
  name: '',
  unit: '',
  onDepositSuccess() {},
};

export default AssetRow;
