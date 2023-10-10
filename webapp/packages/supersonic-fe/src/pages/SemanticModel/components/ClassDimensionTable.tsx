import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { message, Button, Space, Popconfirm, Input } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';
import type { StateType } from '../model';
import { SENSITIVE_LEVEL_ENUM } from '../constant';
import { getDatasourceList, getDimensionList, deleteDimension } from '../service';
import DimensionInfoModal from './DimensionInfoModal';
import DimensionValueSettingModal from './DimensionValueSettingModal';
import { ISemantic } from '../data';
import moment from 'moment';
import styles from './style.less';

type Props = {
  dispatch: Dispatch;
  domainManger: StateType;
};

const ClassDimensionTable: React.FC<Props> = ({ domainManger, dispatch }) => {
  const { selectModelId: modelId } = domainManger;
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [dimensionItem, setDimensionItem] = useState<ISemantic.IDimensionItem>();
  const [dataSourceList, setDataSourceList] = useState<any[]>([]);
  const [dimensionValueSettingList, setDimensionValueSettingList] = useState<
    ISemantic.IDimensionValueSettingItem[]
  >([]);
  const [dimensionValueSettingModalVisible, setDimensionValueSettingModalVisible] =
    useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const actionRef = useRef<ActionType>();

  const queryDimensionList = async (params: any) => {
    const { code, data, msg } = await getDimensionList({
      ...params,
      ...pagination,
      modelId,
    });
    const { list, pageSize, current, total } = data || {};
    let resData: any = {};
    if (code === 200) {
      setPagination({
        pageSize: Math.min(pageSize, 100),
        current,
        total,
      });

      resData = {
        data: list || [],
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

  const queryDataSourceList = async () => {
    const { code, data, msg } = await getDatasourceList({ modelId });
    if (code === 200) {
      setDataSourceList(data);
    } else {
      message.error(msg);
    }
  };

  useEffect(() => {
    queryDataSourceList();
  }, [modelId]);

  const columns: ProColumns[] = [
    {
      dataIndex: 'id',
      title: 'ID',
      width: 80,
      order: 100,
      search: false,
    },
    {
      dataIndex: 'key',
      title: 'Dimensional Search',
      hideInTable: true,
      renderFormItem: () => <Input placeholder="请输入ID/维度名称/字段名称" />,
    },
    {
      dataIndex: 'name',
      title: 'Dimension Name',
      search: false,
    },
    {
      dataIndex: 'alias',
      title: 'Alias',
      width: 300,
      ellipsis: true,
      search: false,
    },
    {
      dataIndex: 'bizName',
      title: 'Business Name',
      search: false,
      // order: 9,
    },
    {
      dataIndex: 'sensitiveLevel',
      title: 'Sensitivity',
      width: 80,
      valueEnum: SENSITIVE_LEVEL_ENUM,
    },

    {
      dataIndex: 'datasourceName',
      title: 'DataSource Name',
      search: false,
    },
    {
      dataIndex: 'createdBy',
      title: 'Created by',
      search: false,
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
              key="dimensionEditBtn"
              onClick={() => {
                setDimensionItem(record);
                setCreateModalVisible(true);
              }}
            >
              Edit
            </a>
            <a
              key="dimensionValueEditBtn"
              onClick={() => {
                setDimensionItem(record);
                setDimensionValueSettingModalVisible(true);
                if (Array.isArray(record.dimValueMaps)) {
                  setDimensionValueSettingList(record.dimValueMaps);
                } else {
                  setDimensionValueSettingList([]);
                }
              }}
            >
              Dimension value settings
            </a>
            <Popconfirm
              title="Confirm deletion?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                const { code, msg } = await deleteDimension(record.id);
                if (code === 200) {
                  setDimensionItem(undefined);
                  actionRef.current?.reload();
                } else {
                  message.error(msg);
                }
              }}
            >
              <a
                key="dimensionDeleteEditBtn"
                onClick={() => {
                  setDimensionItem(record);
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

  return (
    <>
      <ProTable
        className={`${styles.classTable} ${styles.classTableSelectColumnAlignLeft}`}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={queryDimensionList}
        pagination={pagination}
        search={{
          span: 4,
          defaultCollapsed: false,
          collapseRender: () => {
            return <></>;
          },
        }}
        onChange={(data: any) => {
          const { current, pageSize, total } = data;
          setPagination({
            current,
            pageSize,
            total,
          });
        }}
        tableAlertRender={() => {
          return false;
        }}
        size="small"
        options={{ reload: false, density: false, fullScreen: false }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setDimensionItem(undefined);
              setCreateModalVisible(true);
            }}
          >
            Create a dimension
          </Button>,
        ]}
      />

      {createModalVisible && (
        <DimensionInfoModal
          modelId={modelId}
          bindModalVisible={createModalVisible}
          dimensionItem={dimensionItem}
          dataSourceList={dataSourceList}
          onSubmit={() => {
            setCreateModalVisible(false);
            actionRef?.current?.reload();
            dispatch({
              type: 'domainManger/queryDimensionList',
              payload: {
                modelId,
              },
            });
            return;
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      )}
      {dimensionValueSettingModalVisible && (
        <DimensionValueSettingModal
          dimensionValueSettingList={dimensionValueSettingList}
          open={dimensionValueSettingModalVisible}
          dimensionItem={dimensionItem}
          onCancel={() => {
            setDimensionValueSettingModalVisible(false);
          }}
          onSubmit={() => {
            actionRef?.current?.reload();
            dispatch({
              type: 'domainManger/queryDimensionList',
              payload: {
                modelId,
              },
            });
            setDimensionValueSettingModalVisible(false);
          }}
        />
      )}
    </>
  );
};
export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(ClassDimensionTable);
