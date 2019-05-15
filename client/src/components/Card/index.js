import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './card.scss';

const Card = ({
  className,
  contentClassName,
  content,
  contentStub,
  stubRatio,
  orientation,
  layer,
  onClick,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const wrapperClassName = classnames(
    className,
    {
      'card-h': isHorizontal,
      'card-v': !isHorizontal,
      modal: layer > 1,
      clickable: onClick,
    },
  );

  const contentStyles = {};
  const stubStyles = {};
  if (isHorizontal && stubRatio) {
    contentStyles.width = `${100 - stubRatio}%`;
    stubStyles.width = `${stubRatio}%`;
  }

  return (
    <div
      className={wrapperClassName}
      onClick={() => onClick && onClick()}
    >
      <div
        className={classnames(
          contentClassName,
          'content',
        )}
        style={contentStyles}
      >
        {content}
        <div className={isHorizontal ? 'deco-right' : 'deco-bottom'}>
          <span className={isHorizontal ? 'spot-top' : 'spot-left'} />
          <span className={isHorizontal ? 'spot-bottom' : 'spot-right'} />
        </div>
      </div>
      <div
        className="stub"
        style={stubStyles}
      >
        <div className={isHorizontal ? 'deco-left' : 'deco-top'}>
          <span className={isHorizontal ? 'spot-top' : 'spot-left'} />
          <span className={isHorizontal ? 'spot-bottom' : 'spot-right'} />
        </div>
        {contentStub}
      </div>
    </div>
  );
};

Card.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  contentClassName: PropTypes.string,
  content: PropTypes.node.isRequired,
  contentStub: PropTypes.node.isRequired,
  stubRatio: PropTypes.number,
  layer: PropTypes.number,
  onClick: PropTypes.func,
};

Card.defaultProps = {
  className: '',
  contentClassName: '',
  orientation: 'vertical',
  stubRatio: 0,
  layer: 0,
  onClick: null,
};

export default Card;
