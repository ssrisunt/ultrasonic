import { Table, Transfer, Checkbox, Button, Space, message, Tooltip } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import type { TransferItem } from 'antd/es/transfer';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import difference from 'lodash/difference';
import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import type { StateType } from '../../model';
import type { IChatConfig } from '../../data';
import DimensionValueSettingModal from './DimensionValueSettingModal';
import TransTypeTag from '../TransTypeTag';
import TableTitleTooltips from '../../components/TableTitleTooltips';
import { RedoOutlined } from '@ant-design/icons';
import { SemanticNodeType, DictTaskState, TransType } from '../../enum';
import { createDictTask, searchDictLatestTaskList } from '@/pages/SemanticModel/service';
import styles from '../style.less';
interface RecordType {
  id: number;
  key: string;
  name: string;
  bizName: string;
  type: TransType.DIMENSION | TransType.METRIC;
}

type Props = {
  domainManger: StateType;
  knowledgeInfosMap?: IChatConfig.IKnowledgeInfosItemMap;
  onKnowledgeInfosMapChange?: (knowledgeInfosMap: IChatConfig.IKnowledgeInfosItemMap) => void;
  [key: string]: any;
};

type TaskStateMap = Record<string, DictTaskState>;

const DimensionMetricVisibleTableTransfer: React.FC<Props> = ({
  domainManger,
  knowledgeInfosMap,
  onKnowledgeInfosMapChange,
  ...restProps
}) => {
  const { selectModelId: modelId } = domainManger;
  const [dimensionValueSettingModalVisible, setDimensionValueSettingModalVisible] =
    useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<RecordType>({} as RecordType);
  const [currentDimensionSettingFormData, setCurrentDimensionSettingFormData] =
    useState<IChatConfig.IKnowledgeConfig>();

  const [recordLoadingMap, setRecordLoadingMap] = useState<Record<string, boolean>>({});

  const [taskStateMap, setTaskStateMap] = useState<TaskStateMap>({});

  useEffect(() => {
    queryDictLatestTaskList();
  }, []);

  const updateKnowledgeInfosMap = (record: RecordType, updateData: Record<string, any>) => {
    const { bizName, id } = record;
    const knowledgeMap = {
      ...knowledgeInfosMap,
    };
    const target = knowledgeMap[bizName];
    if (target) {
      knowledgeMap[bizName] = {
        ...target,
        ...updateData,
      };
    } else {
      knowledgeMap[bizName] = {
        itemId: id,
        bizName,
        ...updateData,
      };
    }
    onKnowledgeInfosMapChange?.(knowledgeMap);
  };

  const queryDictLatestTaskList = async () => {
    const { code, data } = await searchDictLatestTaskList({
      modelId,
    });
    if (code !== 200) {
      message.error('Get dictionary import task failed!');
      return;
    }
    const tastMap = data.reduce(
      (stateMap: TaskStateMap, item: { dimId: number; status: DictTaskState }) => {
        const { dimId, status } = item;
        stateMap[dimId] = status;
        return stateMap;
      },
      {},
    );
    setTaskStateMap(tastMap);
  };

  const createDictTaskQuery = async (recordData: RecordType) => {
    setRecordLoadingMap({
      ...recordLoadingMap,
      [recordData.id]: true,
    });
    const { code } = await createDictTask({
      updateMode: 'REALTIME_ADD',
      modelAndDimPair: {
        [modelId]: [recordData.id],
      },
    });
    setRecordLoadingMap({
      ...recordLoadingMap,
      [recordData.id]: false,
    });
    if (code !== 200) {
      message.error('Dictionary import task created failed!');
      return;
    }
    setTimeout(() => {
      queryDictLatestTaskList();
    }, 2000);
  };

  const deleteDictTask = async (recordData: RecordType) => {
    const { code } = await createDictTask({
      updateMode: 'REALTIME_DELETE',
      modelAndDimPair: {
        [modelId]: [recordData.id],
      },
    });
    if (code !== 200) {
      message.error('Delete dictionary import task creation failed!');
    }
  };

  let rightColumns: ColumnsType<RecordType> = [
    {
      dataIndex: 'name',
      title: 'Name',
    },
    {
      dataIndex: 'type',
      width: 80,
      title: 'Type',
      render: (type: SemanticNodeType) => {
        return <TransTypeTag type={type} />;
      },
    },
    {
      dataIndex: 'y',
      title: (
        <TableTitleTooltips
          title="Dimension values are visible"
          tooltips="When Visible is checked, dimension values will be associated when searching"
        />
      ),
      width: 120,
      render: (_: any, record: RecordType) => {
        const { type, bizName } = record;
        return type === TransType.DIMENSION ? (
          <Checkbox
            checked={knowledgeInfosMap?.[bizName]?.searchEnable}
            onChange={(e: CheckboxChangeEvent) => {
              updateKnowledgeInfosMap(record, { searchEnable: e.target.checked });
              if (!e.target.checked) {
                deleteDictTask(record);
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          />
        ) : (
          <></>
        );
      },
    },
    {
      dataIndex: 'taskState',
      width: 130,
      title: (
        <Space>
          Import dictionary status
          <span
            className={styles.taskStateRefreshIcon}
            onClick={() => {
              queryDictLatestTaskList();
            }}
          >
            <Tooltip title="Refreshes the dictionary task status">
              <RedoOutlined />
            </Tooltip>
          </span>
        </Space>
      ),
      render: (_, record) => {
        const { id, type } = record;
        const target = taskStateMap[id];
        if (type === TransType.DIMENSION && target) {
          return DictTaskState[target] || 'Unknown status';
        }
        return '--';
      },
    },
    {
      title: 'Operate',
      dataIndex: 'x',
      render: (_: any, record: RecordType) => {
        const { type, bizName, id } = record;
        return type === TransType.DIMENSION ? (
          <Space>
            <Button
              style={{ padding: 0 }}
              key="importDictBtn"
              type="link"
              disabled={!knowledgeInfosMap?.[bizName]?.searchEnable}
              loading={!!recordLoadingMap[id]}
              onClick={(event) => {
                createDictTaskQuery(record);
                event.stopPropagation();
              }}
            >
              Import dictionary
            </Button>
            <Button
              style={{ padding: 0 }}
              key="editable"
              type="link"
              disabled={!knowledgeInfosMap?.[bizName]?.searchEnable}
              onClick={(event) => {
                setCurrentRecord(record);
                setCurrentDimensionSettingFormData(
                  knowledgeInfosMap?.[bizName]?.knowledgeAdvancedConfig,
                );
                setDimensionValueSettingModalVisible(true);
                event.stopPropagation();
              }}
            >
             Visible dimension value settings
            </Button>
          </Space>
        ) : (
          <></>
        );
      },
    },
  ];

  const leftColumns: ColumnsType<RecordType> = [
    {
      dataIndex: 'name',
      title: 'Name',
    },
    {
      dataIndex: 'type',
      title: 'Type',
      render: (type) => {
        return <TransTypeTag type={type} />;
      },
    },
  ];
  if (!knowledgeInfosMap) {
    rightColumns = leftColumns;
  }
  return (
    <>
      <Transfer {...restProps}>
        {({
          direction,
          filteredItems,
          onItemSelectAll,
          onItemSelect,
          selectedKeys: listSelectedKeys,
        }) => {
          const columns = direction === 'left' ? leftColumns : rightColumns;
          const rowSelection: TableRowSelection<TransferItem> = {
            onSelectAll(selected, selectedRows) {
              const treeSelectedKeys = selectedRows.map(({ key }) => key);
              const diffKeys = selected
                ? difference(treeSelectedKeys, listSelectedKeys)
                : difference(listSelectedKeys, treeSelectedKeys);
              onItemSelectAll(diffKeys as string[], selected);
            },
            onSelect({ key }, selected) {
              onItemSelect(key as string, selected);
            },
            selectedRowKeys: listSelectedKeys,
          };

          return (
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredItems as any}
              size="small"
              pagination={false}
              scroll={{ y: 450 }}
              onRow={({ key }) => ({
                onClick: () => {
                  onItemSelect(key as string, !listSelectedKeys.includes(key as string));
                },
              })}
            />
          );
        }}
      </Transfer>
      <DimensionValueSettingModal
        visible={dimensionValueSettingModalVisible}
        initialValues={currentDimensionSettingFormData}
        onSubmit={(formValues) => {
          updateKnowledgeInfosMap(currentRecord, { knowledgeAdvancedConfig: formValues });
          setDimensionValueSettingModalVisible(false);
        }}
        onCancel={() => {
          setDimensionValueSettingModalVisible(false);
        }}
      />
    </>
  );
};

// export default DimensionMetricVisibleTableTransfer;
export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(DimensionMetricVisibleTableTransfer);
