import React, {
  PureComponent
} from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../helpers/AuthService';
import {
  Block,
  Form,
  TextButton,
  Button,
} from '@aztec/guacamole-ui';
import FormWrapper from '../FormWrapper';
import loginFormConfig from './config/loginForm.js';
import restoreFormConfig from './config/restoreForm.js';
import CreateSuccess from './CreateSuccess';
import RestoreSuccess from './RestoreSuccess';

class Login extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoading: false,
      error: '',
      displayMode: 'create',
      currentAccount: {},
    };
  }

  handleChangeField = (fieldName, value) => {
    const {
      data: prevData,
    } = this.state;
    const data = {
      ...prevData,
      [fieldName]: value,
    };

    this.setState({
      data,
    });
  };

  handleSubmit = async () => {
    const {
      isLoading,
    } = this.state;
    if (isLoading) return;

    this.setState({
      isLoading: true,
    });

    const {
      data,
      displayMode,
      currentAccount: prevAccount,
    } = this.state;
    let currentAccount = prevAccount;

    try {
      let newAccount;
      if (displayMode === 'create') {
        newAccount = await AuthService.createAccount(data);
      } else if (displayMode === 'restore') {
        newAccount = await AuthService.restoreAccount(data);
      }
      const privateKey = await AuthService.getPrivateKey();
      const {
        seedPhrase,
      } = newAccount;
      currentAccount = {
        seedPhrase,
        privateKey,
      };
    } catch (error) {
      this.setState({
        isLoading: false,
      });
      return;
    }

    this.setState({
      displayMode: `success-${displayMode}`,
      isLoading: false,
      currentAccount,
    });
  };

  handleSwitchDisplayMode = (displayMode) => {
    this.setState({
      displayMode,
    });
  };

  renderExtraLinks() {
    const {
      displayMode,
    } = this.state;
    if (displayMode.startsWith('success-')) {
      const {
        onExitLoginWizard,
      } = this.props;
      return (
        <Button
          text="Continue to App"
          onClick={onExitLoginWizard}
          outlined
        />
      );
    }

    const linkNodes = [];
    if (displayMode !== 'create') {
      linkNodes.push(
        <TextButton
          key="create"
          text="Create New Account"
          onClick={() => this.handleSwitchDisplayMode('create')}
        />
      );
    }
    if (displayMode !== 'restore') {
      linkNodes.push(
        <TextButton
          key="restore"
          text="Restore Account"
          onClick={() => this.handleSwitchDisplayMode('restore')}
        />
      );
    }

    return linkNodes;
  }

  render() {
    const {
      isLoading,
      displayMode,
      currentAccount,
    } = this.state;

    let formConfig;
    switch (displayMode) {
      case 'create':
        formConfig = loginFormConfig
        break;
      case 'restore':
        formConfig = restoreFormConfig
        break;
      default:
    }

    const linkNodes = this.renderExtraLinks();

    return (
      <Block
        padding="xxl 0"
        align={displayMode.startsWith('success-') ? 'center' : 'left'}
      >
        <FormWrapper>
          {formConfig && (
            <Form
              key={displayMode}
              fieldsConfig={formConfig}
              isLoading={isLoading}
              onChange={this.handleChangeField}
              onSubmit={this.handleSubmit}
              expand
            />
          )}
          {displayMode === 'success-create' && (
            <CreateSuccess
              currentAccount={currentAccount}
            />
          )}
          {displayMode === 'success-restore' && (
            <RestoreSuccess
              currentAccount={currentAccount}
            />
          )}
          <Block padding="xl 0 l">
            {linkNodes}
          </Block>
        </FormWrapper>
      </Block>
    );
  }
}

Login.propTypes = {
  onExitLoginWizard: PropTypes.func.isRequired,
};

export default Login;
