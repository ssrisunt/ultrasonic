import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { message, Button, Space, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import ClassDataSourceTypeModal from './ClassDataSourceTypeModal';
import type { StateType } from '../model';
import { getDatasourceList, deleteDatasource } from '../service';
import moment from 'moment';

type Props = {
  dispatch: Dispatch;
  domainManger: StateType;
};

const ClassDataSourceTable: React.FC<Props> = ({ dispatch, domainManger }) => {
  const { selectModelId } = domainManger;
  const [dataSourceItem, setDataSourceItem] = useState<any>();
  const [createDataSourceModalOpen, setCreateDataSourceModalOpen] = useState(false);

  const actionRef = useRef<ActionType>();

  const columns: ProColumns[] = [
    {
      dataIndex: 'id',
      title: 'ID',
    },
    {
      dataIndex: 'name',
      title: 'Data Source Name',
    },
    {
      dataIndex: 'bizName',
      title: 'English Name',
    },
    {
      dataIndex: 'createdBy',
      title: 'Created by',
    },
    {
      dataIndex: 'description',
      title: 'Description',
      search: false,
    },
    {
      dataIndex: 'updatedAt',
      title: 'Update Time',
      search: false,
      render: (value: any) => {
        return value && value !== '-' ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: 'Operation',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        return (
          <Space>
            <a
              key="datasourceEditBtn"
              onClick={() => {
                setDataSourceItem(record);
                setCreateDataSourceModalOpen(true);
              }}
            >
              编辑
            </a>
            <Popconfirm
              title="Confirm deletion?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                const { code, msg } = await deleteDatasource(record.id);
                if (code === 200) {
                  setDataSourceItem(undefined);
                  actionRef.current?.reload();
                } else {
                  message.error(msg);
                }
              }}
            >
              <a
                key="datasourceDeleteBtn"
                onClick={() => {
                  setDataSourceItem(record);
                }}
              >
                Delete
              </a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const queryDataSourceList = async (params: any) => {
    dispatch({
      type: 'domainManger/setPagination',
      payload: {
        ...params,
      },
    });
    const { code, data, msg } = await getDatasourceList({ ...params });
    let resData: any = {};
    if (code === 200) {
      resData = {
        data: data || [],
        success: true,
      };
    } else {
      message.error(msg);
      resData = {
        data: [],
        total: 0,
        success: false,
      };
    }
    return resData;
  };

  return (
    <>
      <ProTable
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        params={{ modelId: selectModelId }}
        request={queryDataSourceList}
        pagination={false}
        search={false}
        size="small"
        options={{ reload: false, density: false, fullScreen: false }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setDataSourceItem(undefined);
              setCreateDataSourceModalOpen(true);
            }}
          >
            Create a data source
          </Button>,
        ]}
      />
      {
        <ClassDataSourceTypeModal
          open={createDataSourceModalOpen}
          onCancel={() => {
            setCreateDataSourceModalOpen(false);
          }}
          dataSourceItem={dataSourceItem}
          onSubmit={() => {
            actionRef.current?.reload();
          }}
        />
      }
    </>
  );
};
export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(ClassDataSourceTable);
