import { Button, Space } from 'antd';
import styles from './style.module.less';
import Copilot from '../Copilot';
import { useRef } from 'react';

const buttonParams = [
  {
    msg: 'Jay Chou Artist trend interpretation',
    agentId: 8,
    modelId: 23,
    filters: [{ bizName: 'singer_id', elementID: 283, value: 4558 }],
  },
  {
    msg: 'Lin Junjie Artist trend interpretation',
    agentId: 8,
    modelId: 23,
    filters: [{ bizName: 'singer_id', elementID: 283, value: 4286 }],
  },
];

const CopilotDemo = () => {
  const copilotRef = useRef<any>();

  return (
    <div className={styles.copilotDemo}>
      <Space>
        {buttonParams.map(params => (
          <Button
            key={params.msg}
            onClick={() => {
              copilotRef?.current?.sendCopilotMsg(params);
            }}
          >
            {params.msg}
          </Button>
        ))}
      </Space>
      <Copilot
        // token={localStorage.getItem('SUPERSONIC_TOKEN') || ''}
        // agentIds={[8]}
        isDeveloper
        // integrateSystem="c2"
        ref={copilotRef}
        // noInput
      />
    </div>
  );
};

export default CopilotDemo;
