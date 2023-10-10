import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Select, Row, Col, Space, Tooltip } from 'antd';
import { SENSITIVE_LEVEL_OPTIONS } from '../constant';
import { formLayout } from '@/components/FormHelper/utils';
import SqlEditor from '@/components/SqlEditor';
import InfoTagList from './InfoTagList';
import { ISemantic } from '../data';
import { InfoCircleOutlined } from '@ant-design/icons';
import { createDimension, updateDimension, mockDimensionAlias } from '../service';

import { message } from 'antd';

export type CreateFormProps = {
  modelId: number;
  dimensionItem?: ISemantic.IDimensionItem;
  onCancel: () => void;
  bindModalVisible: boolean;
  dataSourceList: any[];
  onSubmit: (values?: any) => void;
};

const FormItem = Form.Item;
const { Option } = Select;

const { TextArea } = Input;

const DimensionInfoModal: React.FC<CreateFormProps> = ({
  modelId,
  onCancel,
  bindModalVisible,
  dimensionItem,
  dataSourceList,
  onSubmit: handleUpdate,
}) => {
  const isEdit = !!dimensionItem?.id;
  const [dimensionValueSettingList, setDimensionValueSettingList] = useState<
    ISemantic.IDimensionValueSettingItem[]
  >([]);
  const [form] = Form.useForm();
  const { setFieldsValue, resetFields } = form;
  const [llmLoading, setLlmLoading] = useState<boolean>(false);

  const handleSubmit = async (
    isSilenceSubmit = false,
    dimValueMaps?: ISemantic.IDimensionValueSettingItem[],
  ) => {
    const fieldsValue = await form.validateFields();
    await saveDimension(
      {
        ...fieldsValue,
        dimValueMaps: dimValueMaps || dimensionValueSettingList,
        alias: Array.isArray(fieldsValue.alias) ? fieldsValue.alias.join(',') : '',
      },
      isSilenceSubmit,
    );
  };

  const saveDimension = async (fieldsValue: any, isSilenceSubmit = false) => {
    const queryParams = {
      modelId: isEdit ? dimensionItem.modelId : modelId,
      type: 'categorical',
      ...fieldsValue,
    };
    let saveDimensionQuery = createDimension;
    if (queryParams.id) {
      saveDimensionQuery = updateDimension;
    }
    const { code, msg } = await saveDimensionQuery(queryParams);
    if (code === 200) {
      if (!isSilenceSubmit) {
        message.success('The dimension was edited successfully');
        handleUpdate(fieldsValue);
      }
      return;
    }
    message.error(msg);
  };

  const setFormVal = () => {
    if (dimensionItem) {
      const { alias } = dimensionItem;
      setFieldsValue({ ...dimensionItem, alias: alias && alias.trim() ? alias.split(',') : [] });
    }
  };

  useEffect(() => {
    if (dimensionItem) {
      setFormVal();
      if (Array.isArray(dimensionItem.dimValueMaps)) {
        setDimensionValueSettingList(dimensionItem.dimValueMaps);
      } else {
        setDimensionValueSettingList([]);
      }
    } else {
      resetFields();
    }
    if (!isEdit && Array.isArray(dataSourceList) && dataSourceList[0]?.id) {
      setFieldsValue({ datasourceId: dataSourceList[0].id });
    }
  }, [dimensionItem, dataSourceList]);

  const renderFooter = () => {
    return (
      <>
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

  const generatorDimensionAlias = async () => {
    const fieldsValue = await form.validateFields();
    setLlmLoading(true);
    const { code, data } = await mockDimensionAlias({
      ...dimensionItem,
      ...fieldsValue,
      alias: fieldsValue.alias?.join(','),
    });
    setLlmLoading(false);
    const formAlias = form.getFieldValue('alias');
    setLlmLoading(false);
    if (code === 200) {
      form.setFieldValue('alias', Array.from(new Set([...formAlias, ...data])));
    } else {
      message.error('Large Language Model Parsing Exception');
    }
  };

  const renderContent = () => {
    return (
      <>
        <FormItem hidden={true} name="id" label="ID">
          <Input placeholder="id" />
        </FormItem>
        <FormItem
          name="name"
          label="The dimension name"
          rules={[{ required: true, message: 'Please enter dimension name' }]}
        >
          <Input placeholder="Non-repeatable name" />
        </FormItem>
        <FormItem
          hidden={isEdit}
          name="bizName"
          label="Business Name"
          rules={[{ required: true, message: 'Please enter a field name' }]}
        >
          <Input placeholder="Names are not repeatable" disabled={isEdit} />
        </FormItem>
        <FormItem
          hidden={isEdit}
          name="datasourceId"
          label="The data source"
          rules={[{ required: true, message: 'Please select the data source' }]}
        >
          <Select placeholder="Please select a data source" disabled={isEdit}>
            {dataSourceList.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem label="alias">
          <Row>
            <Col flex="1 1 200px">
              <FormItem name="alias" noStyle>
                <Select
                  mode="tags"
                  placeholder="Enter the alias to confirm, and multi-alias input and copy and paste support automatic separation of English commas"
                  tokenSeparators={[',']}
                  maxTagCount={9}
                />
              </FormItem>
            </Col>
            {isEdit && (
              <Col flex="0 1 75px">
                <Button
                  type="link"
                  size="small"
                  loading={llmLoading}
                  style={{ top: '2px' }}
                  onClick={() => {
                    generatorDimensionAlias();
                  }}
                >
                  <Space>
                    smart_fill
                    <Tooltip title="Smart Fill will use a large language model to get dimension aliases based on information about the dimension">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                </Button>
              </Col>
            )}
          </Row>
        </FormItem>
        <FormItem
          name="semanticType"
          label="Type"
          rules={[{ required: true, message: 'Please select dimension type' }]}
        >
          <Select placeholder="Select a dimension type">
            {['CATEGORY', 'ID', 'DATE'].map((item) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          name="sensitiveLevel"
          label="Sensitivity"
          rules={[{ required: true, message: 'Please select sensitivity' }]}
        >
          <Select placeholder="Please select a sensitivity">
            {SENSITIVE_LEVEL_OPTIONS.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem name="defaultValues" label="Default value">
          <InfoTagList />
        </FormItem>
        <FormItem
          name="description"
          label="Dimension description"
          rules={[{ required: true, message: 'Please enter a dimension description' }]}
        >
          <TextArea placeholder="Please enter a dimension description" />
        </FormItem>
        <FormItem
          name="expr"
          label="Expression"
          tooltip="The fields in the expression must be marked as dates or dimensions when the data source is created"
          rules={[{ required: true, message: 'Please enter an expression' }]}
        >
          <SqlEditor height={'150px'} />
        </FormItem>
      </>
    );
  };

  return (
    <>
      <Modal
        width={800}
        destroyOnClose
        title="Dimension information"
        style={{ top: 48 }}
        maskClosable={false}
        open={bindModalVisible}
        footer={renderFooter()}
        onCancel={onCancel}
      >
        <Form {...formLayout} form={form}>
          {renderContent()}
        </Form>
      </Modal>
    </>
  );
};

export default DimensionInfoModal;
