import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Link,
} from 'react-router-dom';
import {
  Block,
  Icon,
  Text,
  TextButton,
  Button,
} from '@aztec/guacamole-ui';
import {
  getPathByPageName,
} from '../utils/page';
import FormWrapper from '../components/FormWrapper';
import CreateLoanForm from '../components/CreateLoanForm';

class CreateLoan extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      justCreated: false,
    };
  }

  handleLoanCreated = () => {
    this.setState({
      justCreated: true,
    });
  };

  handleClearMessage = () => {
    this.setState({
      justCreated: false,
    });
  };

  render() {
    const {
      currentAddress,
    } = this.props;
    const {
      justCreated,
    } = this.state;

    return (
      <FormWrapper>
        {!justCreated && (
          <CreateLoanForm
            currentAddress={currentAddress}
            onCreateLoan={this.handleLoanCreated}
          />
        )}
        {justCreated && (
          <Block align="center">
            <Block
              top="l"
              bottom="xxl"
            >
              <Icon
                name="thumb_up_alt"
                size="xl"
                color="green"
              />
              <Block top="l">
                <Text
                  text="You've successfully created a new loan. Next, you can:"
                />
              </Block>
            </Block>
            <Block padding="l 0">
              <TextButton
                theme="underline"
                text="Manage issued loans"
                href={getPathByPageName('borrower')}
                Link={Link}
              />
              <Block padding="xl 0">
                <Text
                  text="or"
                  color="label"
                />
              </Block>
              <Button
                text="Create Another Loan"
                onClick={this.handleClearMessage}
              />
            </Block>
          </Block>
        )}
      </FormWrapper>
    );
  }
}

CreateLoan.propTypes = {
  currentAddress: PropTypes.string.isRequired,
};

export default CreateLoan;
