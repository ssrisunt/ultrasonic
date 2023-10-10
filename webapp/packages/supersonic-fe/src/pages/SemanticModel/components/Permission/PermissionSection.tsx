import { Space } from 'antd';
import React from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import type { StateType } from '../../model';
import { ProCard } from '@ant-design/pro-card';
import PermissionTable from './PermissionTable';
import PermissionAdminForm from './PermissionAdminForm';

type Props = {
  permissionTarget: 'model' | 'domain';
  dispatch: Dispatch;
  domainManger: StateType;
};

const PermissionSection: React.FC<Props> = ({ permissionTarget }) => {
  return (
    <>
      <div>
        <Space direction="vertical" style={{ width: '100%' }} size={20}>
          <ProCard title="Invite members" bordered>
            <PermissionAdminForm permissionTarget={permissionTarget} />
          </ProCard>
          {permissionTarget === 'model' && <PermissionTable />}
        </Space>
      </div>
    </>
  );
};
export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(PermissionSection);
