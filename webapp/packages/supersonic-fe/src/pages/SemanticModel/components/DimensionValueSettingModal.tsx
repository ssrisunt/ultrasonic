import React, { useEffect, useState } from 'react';
import { Button, Modal, message, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ISemantic } from '../data';
import CommonEditTable from './CommonEditTable';
import { updateDimension, mockDimensionValuesAlias } from '../service';
import { connect } from 'umi';
import type { StateType } from '../model';

export type CreateFormProps = {
  dimensionValueSettingList: ISemantic.IDimensionValueSettingItem[];
  onCancel: () => void;
  dimensionItem?: ISemantic.IDimensionItem;
  open: boolean;
  onSubmit: (values?: any) => void;
  domainManger: StateType;
};

type TableDataSource = { techName: string; bizName: string; alias?: string[] };

const DimensionInfoModal: React.FC<CreateFormProps> = ({
  onCancel,
  open,
  dimensionItem,
  dimensionValueSettingList,
  domainManger,
  onSubmit,
}) => {
  const [tableDataSource, setTableDataSource] = useState<TableDataSource[]>([]);
  const { selectDomainId } = domainManger;
  const [dimValueMaps, setDimValueMaps] = useState<ISemantic.IDimensionValueSettingItem[]>([]);
  const [llmLoading, setLlmLoading] = useState<boolean>(false);

  useEffect(() => {
    setTableDataSource(dimensionValueSettingList);
    setDimValueMaps(dimensionValueSettingList);
  }, [dimensionValueSettingList]);

  const handleSubmit = async () => {
    await saveDimension({ dimValueMaps });
    onSubmit?.(dimValueMaps);
  };

  const saveDimension = async (fieldsValue: any) => {
    if (!dimensionItem?.id) {
      return;
    }
    const queryParams = {
      domainId: selectDomainId,
      id: dimensionItem.id,
      ...fieldsValue,
    };
    const { code, msg } = await updateDimension(queryParams);
    if (code === 200) {
      return;
    }
    message.error(msg);
  };

  const generatorDimensionValue = async () => {
    setLlmLoading(true);
    const { code, data } = await mockDimensionValuesAlias({ ...dimensionItem });
    setLlmLoading(false);
    if (code === 200) {
      if (Array.isArray(data)) {
        setDimValueMaps([...dimValueMaps, ...data]);
        setTableDataSource([...tableDataSource, ...data]);
      }
    } else {
      message.error('Large language model parsing exceptions');
    }
  };

  const renderFooter = () => {
    return (
      <>
        <Button
          type="primary"
          loading={llmLoading}
          onClick={() => {
            generatorDimensionValue();
          }}
        >
          <Space>
            智能填充
            <Tooltip title="Smart Fill will use a large language model to get dimension values that are likely to be used based on information about the dimension">
              <InfoCircleOutlined />
            </Tooltip>
          </Space>
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          onClick={() => {
            handleSubmit();
          }}
        >
          Finish
        </Button>
      </>
    );
  };

  const columns = [
    {
      title: 'Technical name',
      dataIndex: 'techName',
      width: 200,
      tooltip: 'Dimension value data stored in the database. For example, the dimension values of the dimension platform in the database are kw, qy, etc',
      formItemProps: {
        fieldProps: {
          placeholder: 'Please fill in the technical name',
        },
        rules: [
          {
            required: true,
            whitespace: true,
            message: 'This field is required',
          },
        ],
      },
    },
    {
      title: 'Business name',
      dataIndex: 'bizName',
      width: 200,
      tooltip:
        'After the query is completed, the dimension value information is finally returned to the user. For example, the technical name KW is converted into Kuwo platform, and the final return to the user is Kuwo platform',
      fieldProps: {
        placeholder: 'Please fill in the business name',
      },
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: 'This field is required',
          },
        ],
      },
    },
    {
      title: 'Alias',
      dataIndex: 'alias',
      valueType: 'select',
      width: 500,
      tooltip:
        'When resolving user query intent, the conversion of aliases to technical names is supported. For example, if the user enters kw, kuwo, and kuwo, after completing the settings, they can be converted into the technical name kw',
      fieldProps: {
        placeholder: 'Enter the alias to confirm, and multi-alias input and copy and paste support automatic separation of English commas',
        mode: 'tags',
        maxTagCount: 5,
        tokenSeparators: [','],
      },
    },
  ];
  return (
    <Modal
      width={1200}
      destroyOnClose
      title="Dimension value settings"
      style={{ top: 48 }}
      maskClosable={false}
      open={open}
      footer={renderFooter()}
      onCancel={onCancel}
    >
      <CommonEditTable
        tableDataSource={tableDataSource}
        columnList={columns}
        onDataSourceChange={(tableData) => {
          const dimValueMaps = tableData.map((item: TableDataSource) => {
            return {
              ...item,
              // alias: item.alias ? `${item.alias}`.split(',') : [],
            };
          });

          setDimValueMaps(dimValueMaps);
        }}
      />
    </Modal>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(DimensionInfoModal);
