import React, {
  PureComponent,
} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import {
  PageContentWrapper,
  Block,
  Loader,
} from '@aztec/guacamole-ui';
import '@aztec/guacamole-ui/dist/styles/guacamole-ui.css';
import LoanDapp from './contracts/LoanDapp';
import Loan from './contracts/Loan';
import SettlementToken from './contracts/SettlementToken';
import ACE from './contracts/ACE';
import JoinSplit from './contracts/JoinSplit';
import ZKERC20 from './contracts/ZKERC20';
import LoanPayment from './contracts/LoanPayment';
import Web3Service from './helpers/Web3Service';
import AuthService from './helpers/AuthService';
import CurrencyService from './helpers/CurrencyService';
import NoteManager from './helpers/NoteManager';
import Header from './components/Header';
import PageNavigator from './components/PageNavigator';
import Login from './components/Login';
import PendingLoans from './pages/PendingLoans';
import LenderLoans from './pages/LenderLoans';
import BorrowerLoans from './pages/BorrowerLoans';
import CreateLoan from './pages/CreateLoan';
import AccountBalance from './pages/AccountBalance';
import {
  homePage,
} from './config/page';
import {
  pageName,
  getPathByPageName,
} from './utils/page';
import {
  USE_HOT_WALLET,
} from './config/app';
import './App.css';

const pageComponentMap = {
  [pageName('pending')]: PendingLoans,
  [pageName('lender')]: LenderLoans,
  [pageName('borrower')]: BorrowerLoans,
  [pageName('create')]: CreateLoan,
  [pageName('balance')]: AccountBalance,
};

const HomePage = pageComponentMap[homePage];

class App extends PureComponent {
  aboutToUnmount = false;

  state = {
    currentAddress: '',
    isWeb3Loaded: false,
    showLogin: false,
    error: null,
  };

  componentDidMount() {
    this.initWeb3Service();
  }

  componentWillUnmount() {
    this.aboutToUnmount = true;
  }

  async initWeb3Service() {
    await Web3Service.init(USE_HOT_WALLET);

    if (USE_HOT_WALLET && !AuthService.isLoggedIn) {
      if (this.aboutToUnmount) return;
      this.setState({
        showLogin: true,
      });
      return;
    }

    await Web3Service.registerContract(LoanDapp);
    await Web3Service.registerContract(ACE);
    await Web3Service.registerContract(JoinSplit);
    await Web3Service.registerContract(LoanPayment);

    await Web3Service.registerInterface(ZKERC20);
    await Web3Service.registerInterface(SettlementToken);
    await Web3Service.registerInterface(Loan);

    const currentAddress = Web3Service.getAddress();

    await CurrencyService.initAddresses();

    Web3Service.onAddressChanged(this.handleChangeAddress);

    if (this.aboutToUnmount) return;
    this.setState({
      isWeb3Loaded: true,
      showLogin: false,
      currentAddress,
    });
  }

  handleLoginSuccess = () => {
    this.initWeb3Service();
  }

  handleChangeAddress = (account) => {
    NoteManager.reset();
    this.initWeb3Service();
  };

  render() {
    const {
      isWeb3Loaded,
      showLogin,
      currentAddress,
    } = this.state;

    return (
      <Router>
        <div className="App">
          <Header
            className="App-header"
          />
          <div className="App-content">
            <PageContentWrapper
              className="App-scrollable-content"
              background="grey-lightest"
              alignCenter
              stretch
            >
              {showLogin && (
                <Login
                  onExitLoginWizard={this.handleLoginSuccess}
                />
              )}
              {isWeb3Loaded && !showLogin && (
                <Block padding="xxl 0">
                  <Block bottom="xl">
                    <PageNavigator
                      routes={[
                        pageName('pending'),
                        pageName('lender'),
                        pageName('borrower'),
                        pageName('create'),
                      ]}
                    />
                  </Block>
                  <Block padding="xl 0">
                    <Switch>
                      {Object.keys(pageComponentMap).map((name) => {
                        const PageComponent = pageComponentMap[name];
                        return (
                          <Route
                            key={name}
                            path={getPathByPageName(name)}
                            component={routeProps => (
                              <PageComponent
                                {...routeProps}
                                currentAddress={currentAddress}
                              />
                            )}
                          />
                        );
                      })}
                      <Route
                        path="/"
                        component={routeProps => (
                          <HomePage
                            {...routeProps}
                            currentAddress={currentAddress}
                          />
                        )}
                      />
                    </Switch>
                  </Block>
                </Block>
              )}
            </PageContentWrapper>
            {!showLogin && !isWeb3Loaded && (
              <Loader
                hasBackground
              />
            )}
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
