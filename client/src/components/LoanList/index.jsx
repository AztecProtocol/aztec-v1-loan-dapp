import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import {
  Offset,
  FlexBox,
  Block,
  SelectInput,
} from '@aztec/guacamole-ui';
import {
  ASC,
  DESC,
} from '@aztec/guacamole-ui/dist/utils/sort';
import Loan from '../Loan';
import LoanPlaceholder from '../LoanPlaceholder';
import SortSelectInput from '../SortSelectInput';
import sortItemGroups from './config/sortItemGroups';
import sortLoans from './utils/sortLoans';

class LoanList extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      loans,
    } = nextProps;
    const {
      loans: prevLoans,
    } = prevState.prevProps;
    if (loans === prevLoans) {
      return null;
    }

    const {
      sortBy,
      sortOrder,
    } = prevState;

    const sortedLoans = sortLoans(
      loans,
      sortBy,
      sortOrder,
    );

    return {
      sortedLoans,
      prevProps: {
        loans,
      },
    };
  }

  constructor(props) {
    super(props);

    const {
      defaultSortBy,
      defaultSortOrder,
    } = props;

    this.state = {
      sortBy: defaultSortBy,
      sortOrder: defaultSortOrder,
      sortedLoans: [],
      prevProps: {
        loans: [],
      },
    };
  }

  handleChangeSort = (value) => {
    const [
      sortBy,
      sortOrderText,
    ] = value.split('_');
    const sortOrder = sortOrderText === 'DESC' ? DESC : ASC;
    const {
      sortBy: prevSortBy,
      sortOrder: prevSortOrder,
    } = this.state;
    if (sortBy === prevSortBy
      && sortOrder === prevSortOrder
    ) {
      return;
    }

    const {
      loans,
    } = this.props;

    const sortedLoans = sortLoans(
      loans,
      sortBy,
      sortOrder,
    );

    this.setState({
      sortBy,
      sortOrder,
      sortedLoans,
    });
  };

  renderSortSelect() {
    const {
      isLoading,
    } = this.props;
    const {
      sortBy,
      sortOrder,
    } = this.state;

    return (
      <SelectInput
        value={`${sortBy}_${sortOrder === ASC ? 'ASC' : 'DESC'}`}
        itemGroups={sortItemGroups}
        InputComponent={SortSelectInput}
        onSelect={this.handleChangeSort}
        disabled={isLoading}
      />
    );
  }

  render() {
    const {
      currentAddress,
      numberOfPlaceholders,
      isLoading,
    } = this.props;
    const {
      sortedLoans,
    } = this.state;

    const loanNodes = sortedLoans.map(loan => (
      <Block
        key={loan.id}
        padding="m 0"
      >
        <Loan
          currentAddress={currentAddress}
          loan={loan}
        />
      </Block>
    ));

    if (isLoading) {
      for (let i = 0; i < numberOfPlaceholders; i += 1) {
        loanNodes.push(
          <Block
            key={`${+i}`}
            padding="m 0"
          >
            <LoanPlaceholder />
          </Block>
        );
      }
    }

    return (
      <Offset margin="m 0">
        <Block padding="m 0">
          <FlexBox
            align="space-between"
            valign="center"
          >
            <div />
            {this.renderSortSelect()}
          </FlexBox>
        </Block>
        {loanNodes}
      </Offset>
    );
  }
}

LoanList.propTypes = {
  currentAddress: PropTypes.string.isRequired,
  loans: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
  })).isRequired,
  defaultSortBy: PropTypes.string,
  defaultSortOrder: PropTypes.oneOf([
    ASC,
    DESC,
  ]),
  isLoading: PropTypes.bool,
};

LoanList.defaultProps = {
  isLoading: false,
  defaultSortBy: 'createdAt',
  defaultSortOrder: DESC,
};

export default LoanList;
