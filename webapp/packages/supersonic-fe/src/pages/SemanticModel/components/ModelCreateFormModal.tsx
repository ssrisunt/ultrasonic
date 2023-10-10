import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, Input, Switch, Select } from 'antd';
import styles from './style.less';
import { message } from 'antd';
import { formLayout } from '@/components/FormHelper/utils';
import { createModel, updateModel } from '../service';

const FormItem = Form.Item;

export type ModelCreateFormModalProps = {
  domainId: number;
  basicInfo: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
};

const ModelCreateFormModal: React.FC<ModelCreateFormModalProps> = (props) => {
  const { basicInfo, domainId, onCancel, onSubmit } = props;

  const [formVals, setFormVals] = useState<any>(basicInfo);
  const [saveLoading, setSaveLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...basicInfo,
      alias: basicInfo?.alias && basicInfo.alias.trim() ? basicInfo.alias.split(',') : [],
    });
  }, [basicInfo]);

  const handleConfirm = async () => {
    const fieldsValue = await form.validateFields();
    const columnsValue = { ...fieldsValue, isUnique: 1, domainId };
    const submitData = {
      ...formVals,
      ...columnsValue,
      alias: Array.isArray(fieldsValue.alias) ? fieldsValue.alias.join(',') : '',
    };
    setFormVals(submitData);
    setSaveLoading(true);
    const { code, msg } = await (!submitData.id ? createModel : updateModel)(submitData);
    setSaveLoading(false);
    if (code === 200) {
      onSubmit?.(submitData);
    } else {
      message.error(msg);
    }
  };

  const footer = (
    <>
      <Button onClick={onCancel}>Cancel</Button>
      <Button type="primary" loading={saveLoading} onClick={handleConfirm}>
        Are you sure?
      </Button>
    </>
  );

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={'Model information'}
      open={true}
      footer={footer}
      onCancel={onCancel}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          ...formVals,
        }}
        className={styles.form}
      >
        <FormItem
          name="name"
          label="Model name"
          rules={[{ required: true, message: 'Please enter a model name!' }]}
        >
          <Input placeholder="Model names are not repeatable" />
        </FormItem>
        <FormItem
          name="bizName"
          label="business model name"
          rules={[{ required: true, message: 'Please enter the English name of the model!' }]}
        >
          <Input placeholder="Please enter the English name of the model" />
        </FormItem>
        <FormItem name="alias" label="Alias">
          <Select
            mode="tags"
            placeholder="Enter after entering the alias to confirm, multi-alias input, copy and paste support automatic separation of English commas"
            tokenSeparators={[',']}
            maxTagCount={9}
          />
        </FormItem>
        <FormItem name="description" label="Model description">
          <Input.TextArea placeholder="Model description" />
        </FormItem>
        <FormItem name="isUnique" label="Whether it is only 一" hidden={true}>
          <Switch size="small" checked={true} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default ModelCreateFormModal;
