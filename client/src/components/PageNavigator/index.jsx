import React from 'react';
import PropTypes from 'prop-types';
import {
  Offset,
  Block,
  TextButton,
} from '@aztec/guacamole-ui';
import {
  withRouter,
} from 'react-router';
import {
  Link,
} from 'react-router-dom';
import {
  routes as routesConfig,
} from '../../config/page';

const PageNavigator = ({
  routes,
  location,
}) => {
  const {
    pathname: currentPath,
  } = location;

  return (
    <Offset margin="m">
      {routes.map((name) => {
        const {
          path,
          title,
        } = routesConfig.find(config => config.name === name) || {};
        if (!path) {
          return null;
        }

        return (
          <Block
            key={name}
            padding="m"
            inline
          >
            <TextButton
              theme="normal"
              text={title}
              color={path === currentPath ? 'primary' : 'secondary'}
              href={path}
              Link={Link}
            />
          </Block>
        );
      })}
    </Offset>
  );
};

PageNavigator.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.string).isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(PageNavigator);
