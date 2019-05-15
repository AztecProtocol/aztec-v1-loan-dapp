import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Form,
} from '@aztec/guacamole-ui';
import {
  errorLog,
} from '../../utils/log';
import {
  createLoan,
  approveLoan,
} from '../../utils/loan';
import QueryNewLoan from '../../queries/QueryNewLoan';
import formConfig from './config/createLoanForm';
import getDefaultFormData from './utils/getDefaultFormData';
import transformDataForContract from './utils/transformDataForContract';
import NewLoanHandler from './NewLoanHandler';

class CreateLoanForm extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: getDefaultFormData(formConfig[0].fields),
      loanId: '',
      loanNote: null,
      isLoading: false,
      error: '',
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

  handleSubmit = () => {
    const {
      data,
    } = this.state;
    const loan = transformDataForContract(data);

    this.setState(
      {
        isLoading: true,
      },
      () => this.createLoan(loan),
    );
  };

  resetForm() {
    this.setState({
      data: getDefaultFormData(formConfig[0].fields),
      loanId: '',
      loanNote: null,
      isLoading: false,
      error: '',
    });
  }

  async createLoan(loan) {
    try {
      const loanNote = await createLoan(loan);

      this.setState({
        loanNote,
      });
    } catch (error) {
      errorLog(error);
      this.setState({
        isLoading: false,
        error,
      });
    }
  }

  async approveLoan() {
    const {
      loanId,
      loanNote,
    } = this.state;

    try {
      await approveLoan({
        loanId,
        loanNote,
      });
    } catch (error) {
      errorLog(error);
      this.setState({
        isLoading: false,
        error,
      });
      return;
    }

    const {
      onCreateLoan,
    } = this.props;

    this.resetForm();
    onCreateLoan();
  }

  handleLoanCreated = (loanId) => {
    this.setState(
      {
        loanId,
      },
      this.approveLoan,
    );
  };

  render() {
    const {
      currentAddress,
    } = this.props;
    const {
      data,
      loanId,
      loanNote,
      isLoading,
    } = this.state;
    let expectedNotional;
    if (loanNote) {
      ({
        noteHash: expectedNotional,
      } = loanNote.exportNote());
    }

    return (
      <div>
        <Form
          fieldsConfig={formConfig}
          data={data}
          isLoading={isLoading}
          onChange={this.handleChangeField}
          onSubmit={this.handleSubmit}
          expand
        />
        {isLoading && !loanId && (
          <QueryNewLoan
            currentAddress={currentAddress}
          >
            {({
              data: {
                loans,
              } = {},
              isLoading,
            }) => (
              <NewLoanHandler
                expectedNotional={expectedNotional}
                newLoan={loans && loans[0]}
                isLoading={isLoading}
                onReceiveNewLoan={this.handleLoanCreated}
              />
            )}
          </QueryNewLoan>
        )}
      </div>
    );
  }
}

CreateLoanForm.propTypes = {
  currentAddress: PropTypes.string.isRequired,
  onCreateLoan: PropTypes.func,
};

CreateLoanForm.defaultProps = {
  onCreateLoan() {},
};

export default CreateLoanForm;
