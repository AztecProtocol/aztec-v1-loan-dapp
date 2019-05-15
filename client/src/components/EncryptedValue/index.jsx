import React, {
  PureComponent,
} from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import {
  Icon,
  Text,
} from '@aztec/guacamole-ui';
import {
  decryptNoteValue,
} from '../../utils/note';
import EncryptedValueLoader from '../EncryptedValueLoader';

class EncryptedValue extends PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      isControlled,
    } = prevState;
    if (isControlled) {
      const {
        value,
        isDecrypting,
      } = nextProps;
      return {
        value: isDecrypting ? null : value,
      };
    }

    const {
      viewingKey,
    } = nextProps;
    const {
      viewingKey: prevViewingKey,
    } = prevState.prevProps;
    if (viewingKey === prevViewingKey) {
      return null;
    }

    return {
      value: viewingKey ? null : 0,
      prevProps: {
        viewingKey,
      },
    };
  }

  constructor(props) {
    super(props);

    const {
      value,
    } = props;

    this.state = {
      isControlled: value !== undefined,
      value: 0,
      prevProps: {
        viewingKey: '',
      },
    };
  }

  componentDidMount() {
    const {
      viewingKey,
    } = this.props;
    if (viewingKey) {
      this.deriveValue();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      isControlled,
      value,
    } = this.state;
    if (!isControlled
      && value === null
    ) {
      this.deriveValue();
    }
  }

  async deriveValue() {
    const {
      viewingKey: encryptedViewingKey,
    } = this.props;
    const value = await decryptNoteValue({
      encryptedViewingKey,
    });
    const {
      value: prevValue,
    } = this.state;

    if (value !== prevValue) {
      this.setState({
        value,
      });

      const {
        onValueDerived,
      } = this.props;
      onValueDerived(value);
    }
  }

  render() {
    const {
      className,
      size,
      loaderColor,
      loaderBackground,
      color,
      weight,
      format,
      isDecrypting,
      isEncrypted,
    } = this.props;
    const {
      value
    } = this.state;

    if (isDecrypting) {
      return (
        <EncryptedValueLoader
          className={className}
          color={loaderColor}
          background={loaderBackground}
          size={size || 's'}
        />
      );
    }

    if (isEncrypted) {
      return (
        <Icon
          className={className}
          name="locked"
          size={size}
          color={color}
        />
      );
    }

    return (
      <Text
        className={className}
        text={numeral(value).format(format)}
        size={size}
        color={color}
        weight={weight}
      />
    );
  }
}

EncryptedValue.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  viewingKey: PropTypes.string,
  size: PropTypes.string,
  loaderColor: PropTypes.oneOf(['', 'white', 'secondary', 'primary']),
  loaderBackground: PropTypes.string,
  color: PropTypes.string,
  weight: PropTypes.string,
  format: PropTypes.string,
  isDecrypting: PropTypes.bool,
  isEncrypted: PropTypes.bool,
  onValueDerived: PropTypes.func,
};

EncryptedValue.defaultProps = {
  className: '',
  value: undefined,
  viewingKey: '',
  size: '',
  loaderColor: '',
  loaderBackground: '',
  color: '',
  weight: 'normal',
  format: '0,0',
  isDecrypting: false,
  isEncrypted: false,
  onValueDerived() {},
};

export default EncryptedValue;
