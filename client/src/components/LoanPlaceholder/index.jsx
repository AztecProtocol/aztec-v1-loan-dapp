import React from 'react';
import {
  FlexBox,
  Row,
  Block,
  Offset,
  DeviceWidthListener,
} from '@aztec/guacamole-ui';
import Card from '../Card';
import LoanTermCol from '../Loan/LoanTermCol';
import EncryptedValueLoader from '../EncryptedValueLoader';
import './LoanPlaceholder.scss';

const LoanPlaceholder = () => {
  const content = (
    <Block padding="m xl">
      <Block
        top="xs"
        bottom="l"
        hasBorderBottom
      >
        <FlexBox
          align="space-between"
          valign="center"
        >
          <EncryptedValueLoader
            size="m"
            background="primary-lighter"
          />
          <div className="LoanPlaceholder date" />
        </FlexBox>
      </Block>
      <Block
        top="m"
        bottom="xxs"
      >
        <Offset margin="s 0">
          <Row>
            <LoanTermCol
              label={<div className="LoanPlaceholder label" />}
              text={<div className="LoanPlaceholder term" />}
            />
            <LoanTermCol
              label={<div className="LoanPlaceholder label" />}
              text={<div className="LoanPlaceholder term" />}
            />
            <LoanTermCol
              label={<div className="LoanPlaceholder label" />}
              text={<div className="LoanPlaceholder term" />}
            />
          </Row>
        </Offset>
      </Block>
    </Block>
  );

  const contentStub = (
    <Block
      padding="l"
      align="right"
      stretch
    >
      <FlexBox
        direction="column"
        align="space-between"
        valign="flex-end"
        stretch
      >
        <div className="LoanPlaceholder tag hide-lte-xs" />
        <div className="LoanPlaceholder button" />
      </FlexBox>
    </Block>
  );

  return (
    <DeviceWidthListener breakpoints={['s']}>
      {({ lt }) => (
        <Card
          orientation={lt.s ? 'vertical' : 'horizontal'}
          content={content}
          contentStub={contentStub}
        />
      )}
    </DeviceWidthListener>
  );
};

export default LoanPlaceholder;
