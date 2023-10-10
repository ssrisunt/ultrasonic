import React, { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import type { IDataSource } from '../data';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { connect } from 'umi';
import type { Dispatch } from 'umi';
import type { StateType } from '../model';

export type CreateFormProps = {
  measuresList: any[];
  selectedMeasuresList: any[];
  onCancel: () => void;
  onSubmit: (selectMeasuresList: any[]) => void;
  createModalVisible: boolean;
  projectManger: StateType;
  dispatch: Dispatch;
};

const BindMeasuresTable: React.FC<CreateFormProps> = ({
  measuresList,
  selectedMeasuresList = [],
  onSubmit,
  onCancel,
  createModalVisible,
  projectManger,
}) => {
  const { searchParams = {} } = projectManger || {};
  const actionRef = useRef<ActionType>();

  const [selectedMeasuresKeys, setSelectedMeasuresKeys] = useState<string[]>(() => {
    return selectedMeasuresList.map((item: any) => {
      return item.bizName;
    });
  });
  const [selectMeasuresList, setSelectMeasuresList] = useState<IDataSource.IMeasuresItem[]>([]);

  const handleSubmit = async () => {
    onSubmit?.(selectMeasuresList);
  };

  const findMeasureItemByName = (bizName: string) => {
    return measuresList.find((item) => {
      return item.bizName === bizName;
    });
  };

  useEffect(() => {
    const selectedMeasures: IDataSource.IMeasuresItem[] = selectedMeasuresKeys.map((bizName) => {
      const item = findMeasureItemByName(bizName);
      return item;
    });
    setSelectMeasuresList([...selectedMeasures]);
  }, [selectedMeasuresKeys]);

  useEffect(() => {}, []);

  const columns: ProColumns[] = [
    {
      dataIndex: 'bizName',
      title: 'Measure Name',
    },
    {
      dataIndex: 'alias',
      title: 'Alias',
    },
    {
      dataIndex: 'agg',
      title: 'Operator Type',
    },
    {
      dataIndex: 'datasourceName',
      title: 'Datasource Name',
    },
  ];
  const renderFooter = () => {
    return (
      <>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          Add the selected metric to the metric
        </Button>
      </>
    );
  };

  const rowSelection = {
    selectedRowKeys: selectedMeasuresKeys,
    onChange: (_selectedRowKeys: any[]) => {
      setSelectedMeasuresKeys([..._selectedRowKeys]);
    },
  };

  return (
    <Modal
      width={800}
      destroyOnClose
      title="Measure addition"
      open={createModalVisible}
      footer={renderFooter()}
      onCancel={() => {
        onCancel();
      }}
    >
      <ProTable
        actionRef={actionRef}
        rowKey="bizName"
        rowSelection={rowSelection}
        columns={columns}
        params={{ ...searchParams }}
        pagination={false}
        dataSource={measuresList}
        size="small"
        search={false}
        options={false}
        scroll={{ y: 800 }}
      />
    </Modal>
  );
};

export default connect(({ projectManger }: { projectManger: StateType }) => ({
  projectManger,
}))(BindMeasuresTable);
