import {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';

const SUBSCRIBE_QUERY = query => gql`
  subscription ${query}
`;

class QueryDataHandler extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      data,
      processData,
      isLoading,
    } = nextProps;
    const {
      data: prevData,
    } = prevState.prevProps;
    if (data === prevData) {
      return null;
    }

    return {
      isSubscribing: !isLoading,
      data: processData(data),
      prevProps: {
        data,
      },
    };
  }

  constructor(props) {
    super(props);

    this.subscription = null;

    this.state = {
      isSubscribing: false,
      data: {},
      prevProps: {
        data: {},
      },
    };
  }

  componentDidMount() {
    const {
      isSubscribing,
    } = this.state;
    if (isSubscribing) {
      this.subscribe();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      isSubscribing,
    } = this.state;
    const {
      isSubscribing: wasSubscribing,
    } = prevProps;
    if (!this.subscription && isSubscribing && !wasSubscribing) {
      this.subscribe();
    }
  }

  subscribe() {
    const {
      query,
      variables,
      subscribeToMore,
    } = this.props;

    this.subscription = subscribeToMore({
      document: SUBSCRIBE_QUERY(query),
      variables: variables,
      updateQuery: (
        prevData,
        {
          subscriptionData,
        },
      ) => this.handleReceiveSubscription(subscriptionData),
    })
  }

  handleReceiveSubscription = (subscriptionData) => {
    const {
      processData,
    } = this.props;

    this.setState({
      data: processData(subscriptionData && subscriptionData.data),
    });
  };

  render() {
    const {
      error,
      isLoading,
      children,
    } = this.props;
    const {
      data,
    } = this.state;

    return children({
      isLoading,
      error,
      data,
    });
  }
}

QueryDataHandler.propTypes = {
  query: PropTypes.string.isRequired,
  variables: PropTypes.object,
  data: PropTypes.object,
  error: PropTypes.object,
  isLoading: PropTypes.bool,
  children: PropTypes.func.isRequired,
  processData: PropTypes.func.isRequired,
  subscribeToMore: PropTypes.func.isRequired,
};

QueryDataHandler.defaultProps = {
  data: {},
  error: null,
  isLoading: false,
};

export default QueryDataHandler;
