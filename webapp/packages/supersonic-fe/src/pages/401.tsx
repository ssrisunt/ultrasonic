import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

const NoAuthPage: React.FC = () => (
  <Result
    status="403"
    title="The current page has no permissions"
    subTitle={1 ? 'Please contact the project administrator to activate permissions' : 'Please apply to join business domain'}
    extra={
      <Button type="primary" onClick={() => history.push('/homepage')}>
        Back to Home
      </Button>
    }
  />
);

export default NoAuthPage;
