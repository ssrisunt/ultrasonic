import { getLeafList } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, message, Popconfirm, Select, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { PARSE_MODE_MAP, PLUGIN_TYPE_MAP } from './constants';
import DetailModal from './DetailModal';
import { deletePlugin, getModelList, getPluginList } from './service';
import styles from './style.less';
import { ModelType, ParseModeEnum, PluginType, PluginTypeEnum } from './type';

const { Search } = Input;

const PluginManage = () => {
  const [name, setName] = useState<string>();
  const [type, setType] = useState<PluginTypeEnum>();
  const [pattern, setPattern] = useState<string>();
  const [model, setModel] = useState<string>();
  const [data, setData] = useState<PluginType[]>([]);
  const [modelList, setModelList] = useState<ModelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPluginDetail, setCurrentPluginDetail] = useState<PluginType>();
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const initModelList = async () => {
    const res = await getModelList();
    setModelList(getLeafList(res.data));
  };

  const updateData = async (filters?: any) => {
    setLoading(true);
    const res = await getPluginList({ name, type, pattern, model, ...(filters || {}) });
    setLoading(false);
    setData(res.data?.map((item) => ({ ...item, config: JSON.parse(item.config || '{}') })) || []);
  };

  useEffect(() => {
    initModelList();
    updateData();
  }, []);

  const onCheckPluginDetail = (record: PluginType) => {
    setCurrentPluginDetail(record);
    setDetailModalVisible(true);
  };

  const onDeletePlugin = async (record: PluginType) => {
    await deletePlugin(record.id);
    message.success('插件删除成功');
    updateData();
  };

  const columns: any[] = [
    {
      title: 'Plug-in name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Model List',
      dataIndex: 'modelList',
      key: 'modelList',
      width: 200,
      render: (value: number[]) => {
        if (value?.includes(-1)) {
          return 'Default';
        }
        return value ? (
          <div className={styles.modelColumn}>
            {value.map((id, index) => {
              const name = modelList.find((model) => model.id === +id)?.name;
              return name ? <Tag key={id}>{name}</Tag> : null;
            })}
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Plug-in type',
      dataIndex: 'type',
      key: 'type',
      render: (value: string) => {
        return (
          <Tag color={value === PluginTypeEnum.WEB_PAGE ? 'blue' : 'cyan'}>
            {PLUGIN_TYPE_MAP[value]}
          </Tag>
        );
      },
    },
    {
      title: 'Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      width: 450,
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: (value: string) => {
        return value || '-';
      },
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value: string) => {
        return value ? moment(value).format('YYYY-MM-DD HH:mm') : '-';
      },
    },
    {
      title: 'Operate',
      dataIndex: 'x',
      key: 'x',
      render: (_: any, record: any) => {
        return (
          <div className={styles.operator}>
            <a
              onClick={() => {
                onCheckPluginDetail(record);
              }}
            >
              Edit
            </a>
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => {
                onDeletePlugin(record);
              }}
            >
              <a>Delete</a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const onModelChange = (value: string) => {
    setModel(value);
    updateData({ model: value });
  };

  const onTypeChange = (value: PluginTypeEnum) => {
    setType(value);
    updateData({ type: value });
  };

  const onSearch = () => {
    updateData();
  };

  const onCreatePlugin = () => {
    setCurrentPluginDetail(undefined);
    setDetailModalVisible(true);
  };

  const onSavePlugin = () => {
    setDetailModalVisible(false);
    updateData();
  };

  return (
    <div className={styles.pluginManage}>
      <div className={styles.filterSection}>
        <div className={styles.filterItem}>
          <div className={styles.filterItemTitle}>Model List</div>
          <Select
            className={styles.filterItemControl}
            placeholder="Please select a Model"
            options={modelList.map((model) => ({ label: model.name, value: model.id }))}
            value={model}
            allowClear
            onChange={onModelChange}
          />
        </div>
        <div className={styles.filterItem}>
          <div className={styles.filterItemTitle}>Plug-in name</div>
          <Search
            className={styles.filterItemControl}
            placeholder="Please enter a plug-in name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onSearch={onSearch}
          />
        </div>
        <div className={styles.filterItem}>
          <div className={styles.filterItemTitle}>Function description</div>
          <Search
            className={styles.filterItemControl}
            placeholder="Please enter a description of the function"
            value={pattern}
            onChange={(e) => {
              setPattern(e.target.value);
            }}
            onSearch={onSearch}
          />
        </div>
        <div className={styles.filterItem}>
          <div className={styles.filterItemTitle}>Plug-in type</div>
          <Select
            className={styles.filterItemControl}
            placeholder="Please select the plug-in type"
            options={Object.keys(PLUGIN_TYPE_MAP).map((key) => ({
              label: PLUGIN_TYPE_MAP[key],
              value: key,
            }))}
            value={type}
            allowClear
            onChange={onTypeChange}
          />
        </div>
      </div>
      <div className={styles.pluginList}>
        <div className={styles.titleBar}>
          <div className={styles.title}>List of plugins</div>
          <Button type="primary" onClick={onCreatePlugin}>
            <PlusOutlined />
            Create a new plug-in
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          size="small"
          pagination={{ defaultPageSize: 20 }}
          loading={loading}
        />
      </div>
      {detailModalVisible && (
        <DetailModal
          detail={currentPluginDetail}
          onSubmit={onSavePlugin}
          onCancel={() => {
            setDetailModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default PluginManage;
