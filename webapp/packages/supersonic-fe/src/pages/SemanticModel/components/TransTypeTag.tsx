import { Tag } from 'antd';
import React from 'react';

import { SemanticNodeType } from '../enum';

type Props = {
  type: SemanticNodeType;
};

const TransTypeTag: React.FC<Props> = ({ type }) => {
  return (
    <>
      {type === SemanticNodeType.DIMENSION ? (
        <Tag color="blue">{'Dimension'}</Tag>
      ) : type === SemanticNodeType.METRIC ? (
        <Tag color="orange">{'Limited Terms'}</Tag>
      ) : type === SemanticNodeType.DATASOURCE ? (
        <Tag color="green">{'Data source'}</Tag>
      ) : (
        <></>
      )}
    </>
  );
};

export default TransTypeTag;
