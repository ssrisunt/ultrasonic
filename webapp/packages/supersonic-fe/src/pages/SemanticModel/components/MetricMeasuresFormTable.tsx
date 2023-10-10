import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Space } from 'antd';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
import SqlEditor from '@/components/SqlEditor';
import BindMeasuresTable from './BindMeasuresTable';
import FormLabelRequire from './FormLabelRequire';
import { ISemantic } from '../data';

type Props = {
  datasourceId?: number;
  typeParams: ISemantic.ITypeParams;
  measuresList: ISemantic.IMeasure[];
  onFieldChange: (measures: ISemantic.IMeasure[]) => void;
  onSqlChange: (sql: string) => void;
};

const { TextArea } = Input;

const MetricMeasuresFormTable: React.FC<Props> = ({
  datasourceId,
  typeParams,
  measuresList,
  onFieldChange,
  onSqlChange,
}) => {
  const actionRef = useRef<ActionType>();

  const [measuresModalVisible, setMeasuresModalVisible] = useState<boolean>(false);
  const [measuresParams, setMeasuresParams] = useState(
    typeParams || {
      expr: '',
      measures: [],
    },
  );

  useEffect(() => {
    setMeasuresParams({ ...typeParams });
  }, [typeParams]);

  const [exprString, setExprString] = useState(typeParams?.expr || '');

  const columns = [
    {
      dataIndex: 'bizName',
      title: 'Measure Name',
    },
    // {
    //   dataIndex: 'alias',
    //   title: '别名',
    //   render: (_: any, record: any) => {
    //     const { alias, name } = record;
    //     const { measures } = measuresParams;
    //     return (
    //       <Input
    //         placeholder="请输入别名"
    //         value={alias}
    //         onChange={(event) => {
    //           const { value } = event.target;
    //           const list = measures.map((item: any) => {
    //             if (item.name === name) {
    //               return {
    //                 ...item,
    //                 alias: value,
    //               };
    //             }
    //             return item;
    //           });
    //           onFieldChange?.(list);
    //         }}
    //       />
    //     );
    //   },
    // },
    {
      dataIndex: 'constraint',
      title: 'Limited Terms',
      tooltip:
        'This qualification is used to limit the caliber when calculating the indicator, acting on the measure, and the dimension used to filter must be marked as a date or dimension when the data source is created, without the WHERE keyword. For example: dimension A="value 1" and dimension B="value 2"',
      render: (_: any, record: any) => {
        const { constraint, name } = record;
        const { measures } = measuresParams;
        return (
          <TextArea
            placeholder="Please enter qualifications"
            value={constraint}
            onChange={(event) => {
              const { value } = event.target;
              const list = measures.map((item: any) => {
                if (item.name === name) {
                  return {
                    ...item,
                    constraint: value,
                  };
                }
                return item;
              });
              onFieldChange?.(list);
            }}
          />
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'x',
      valueType: 'option',
      render: (_: any, record: any) => {
        const { name } = record;
        return (
          <Space>
            <a
              key="deleteBtn"
              onClick={() => {
                const { measures } = measuresParams;
                const list = measures.filter((item: any) => {
                  return item.name !== name;
                });
                onFieldChange?.(list);
              }}
            >
              删除
            </a>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProTable
          actionRef={actionRef}
          headerTitle={<FormLabelRequire title='Measure List' />}
          tooltip="Create a metric based on the measures of all data sources under this topic domain, and the measures in this list have been prefixed with the data source name in order to distinguish them, after selecting the measure, you can write an expression based on these measures, if the selected measure is from different data sources, the system will automatically join to calculate the indicator"
          rowKey="name"
          columns={columns}
          dataSource={measuresParams?.measures || []}
          pagination={false}
          search={false}
          size="small"
          options={false}
          toolBarRender={() => [
            <Button
              key="create"
              type="primary"
              onClick={() => {
                setMeasuresModalVisible(true);
              }}
            >
              增加度量
            </Button>,
          ]}
        />
        <ProCard
          title={<FormLabelRequire title="Measure expressions" />}
          tooltip="A metric expression consists of the metric selected above, and if measures A and B are selected, the expression can be written as A+B"
        >
          <SqlEditor
            value={exprString}
            onChange={(sql: string) => {
              const expr = sql;
              setExprString(expr);
              onSqlChange?.(expr);
            }}
            height={'150px'}
          />
        </ProCard>
      </Space>
      {measuresModalVisible && (
        <BindMeasuresTable
          measuresList={
            datasourceId && Array.isArray(measuresList)
              ? measuresList.filter((item) => item.datasourceId === datasourceId)
              : measuresList
          }
          selectedMeasuresList={measuresParams?.measures || []}
          onSubmit={async (values: any[]) => {
            const measures = values.map(({ bizName, name, expr, datasourceId }) => {
              return {
                bizName,
                name,
                expr,
                datasourceId,
              };
            });
            onFieldChange?.(measures);
            setMeasuresModalVisible(false);
          }}
          onCancel={() => {
            setMeasuresModalVisible(false);
          }}
          createModalVisible={measuresModalVisible}
        />
      )}
    </>
  );
};

export default MetricMeasuresFormTable;
