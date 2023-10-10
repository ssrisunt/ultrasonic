import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';

import { connect } from 'umi';
import type { StateType } from '../../model';

type Props = {
  domainManger: StateType;
  onClick: (params?: { eventName?: string }) => void;
  [key: string]: any;
};

const GraphToolBar: React.FC<Props> = ({ onClick }) => {
  return (
    <div
      style={{
        padding: 0,
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'end',
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
      }}
    >
      <Space>
        <Button
          key="createDatabaseBtn"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => {
            onClick?.({ eventName: 'createDatabase' });
          }}
        >
          Create a new data source
        </Button>
        <Button
          key="createDimensionBtn"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => {
            onClick?.({ eventName: 'createDimension' });
          }}
        >
          Create a new dimension
        </Button>
        <Button
          key="createMetricBtn"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => {
            onClick?.({ eventName: 'createMetric' });
          }}
        >
         Create a new metric
        </Button>
      </Space>
    </div>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(GraphToolBar);
