import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { message, Space, Popconfirm, Tag } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { Dispatch } from 'umi';
import { connect, history } from 'umi';
import type { StateType } from '../model';
import { SENSITIVE_LEVEL_ENUM } from '../constant';
import { queryMetric, deleteMetric } from '../service';
import MetricFilter from './components/MetricFilter';
import MetricInfoCreateForm from '../components/MetricInfoCreateForm';
import moment from 'moment';
import styles from './style.less';
import { IDataSource, ISemantic } from '../data';

type Props = {
  dispatch: Dispatch;
  domainManger: StateType;
};

type QueryMetricListParams = {
  id?: string;
  name?: string;
  bizName?: string;
  sensitiveLevel?: string;
  type?: string;
  [key: string]: any;
};

const ClassMetricTable: React.FC<Props> = ({ domainManger, dispatch }) => {
  const { selectDomainId, selectModelId: modelId } = domainManger;
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<IDataSource.IDataSourceItem[]>([]);
  const [metricItem, setMetricItem] = useState<ISemantic.IMetricItem>();
  const [filterParams, setFilterParams] = useState<Record<string, any>>({});
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    queryMetricList();
  }, []);

  const queryMetricList = async (params: QueryMetricListParams = {}, disabledLoading = false) => {
    if (!disabledLoading) {
      setLoading(true);
    }
    const { code, data, msg } = await queryMetric({
      ...pagination,
      ...params,
    });
    if (!disabledLoading) {
      setLoading(false);
    }
    const { list, pageSize, current, total } = data || {};
    let resData: any = {};
    if (code === 200) {
      setPagination({
        pageSize: Math.min(pageSize, 100),
        current,
        total,
      });
      setDataSource(list);
      resData = {
        data: list || [],
        success: true,
      };
    } else {
      message.error(msg);
      setDataSource([]);
      resData = {
        data: [],
        total: 0,
        success: false,
      };
    }
    return resData;
  };

  const columns: ProColumns[] = [
    {
      dataIndex: 'id',
      title: 'ID',
    },
    {
      dataIndex: 'name',
      title: 'Metric name',
      render: (_, record: any) => {
        if (record.hasAdminRes) {
          return (
            <a
              onClick={() => {
                history.replace(`/model/${record.domainId}/${record.modelId}/metric`);
              }}
            >
              {record.name}
            </a>
          );
        }
        return <> {record.name}</>;
      },
    },
    // {
    //   dataIndex: 'alias',
    //   title: '别名',
    //   search: false,
    // },
    // {
    //   dataIndex: 'bizName',
    //   title: '字段名称',
    // },
    {
      dataIndex: 'modelName',
      title: 'Model Name',
    },
    {
      dataIndex: 'sensitiveLevel',
      title: 'Sensitivity Level',
      valueEnum: SENSITIVE_LEVEL_ENUM,
    },
    {
      dataIndex: 'createdBy',
      title: 'Created By',
      search: false,
    },
    {
      dataIndex: 'tags',
      title: 'tag',
      search: false,
      render: (tags) => {
        if (Array.isArray(tags)) {
          return (
            <Space size={2}>
              {tags.map((tag) => (
                <Tag color="blue" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Space>
          );
        }
        return <>--</>;
      },
    },
    {
      dataIndex: 'description',
      title: 'Description',
      search: false,
    },
    // {
    //   dataIndex: 'type',
    //   title: '指标类型',
    //   valueEnum: {
    //     ATOMIC: '原子指标',
    //     DERIVED: '衍生指标',
    //   },
    // },

    {
      dataIndex: 'updatedAt',
      title: 'Updated At',
      search: false,
      render: (value: any) => {
        return value && value !== '-' ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-';
      },
    },
    {
      title: 'Operate',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        if (record.hasAdminRes) {
          return (
            <Space>
              <a
                key="metricEditBtn"
                onClick={() => {
                  setMetricItem(record);
                  setCreateModalVisible(true);
                }}
              >
                Edit
              </a>

              <Popconfirm
                title="Confirm deletion?"
                okText="Ok"
                cancelText="Cancel"
                onConfirm={async () => {
                  const { code, msg } = await deleteMetric(record.id);
                  if (code === 200) {
                    setMetricItem(undefined);
                    queryMetricList();
                  } else {
                    message.error(msg);
                  }
                }}
              >
                <a
                  key="metricDeleteBtn"
                  onClick={() => {
                    setMetricItem(record);
                  }}
                >
                  Delete
                </a>
              </Popconfirm>
            </Space>
          );
        } else {
          return <></>;
        }
      },
    },
  ];

  const handleFilterChange = async (filterParams: {
    key: string;
    sensitiveLevel: string;
    type: string;
  }) => {
    const { sensitiveLevel, type } = filterParams;
    const params: QueryMetricListParams = { ...filterParams };
    const sensitiveLevelValue = sensitiveLevel?.[0];
    const typeValue = type?.[0];

    params.sensitiveLevel = sensitiveLevelValue;
    params.type = typeValue;
    setFilterParams(params);
    await queryMetricList(params, filterParams.key ? false : true);
  };

  return (
    <>
      <div className={styles.metricFilterWrapper}>
        <MetricFilter
          onFiltersChange={(_, values) => {
            handleFilterChange(values);
          }}
        />
      </div>
      <ProTable
        className={`${styles.metricTable}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        tableAlertRender={() => {
          return false;
        }}
        loading={loading}
        onChange={(data: any) => {
          const { current, pageSize, total } = data;
          const pagin = {
            current,
            pageSize,
            total,
          };
          setPagination(pagin);
          queryMetricList({ ...pagin, ...filterParams });
        }}
        size="small"
        options={{ reload: false, density: false, fullScreen: false }}
      />
      {createModalVisible && (
        <MetricInfoCreateForm
          domainId={Number(selectDomainId)}
          createModalVisible={createModalVisible}
          modelId={modelId}
          metricItem={metricItem}
          onSubmit={() => {
            setCreateModalVisible(false);
            queryMetricList();
            dispatch({
              type: 'domainManger/queryMetricList',
              payload: {
                domainId: selectDomainId,
              },
            });
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      )}
    </>
  );
};
export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(ClassMetricTable);
