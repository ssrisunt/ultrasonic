import React, { useState } from 'react';
import { Form, Button, Modal, Input, Switch } from 'antd';
import styles from './style.less';
import { useMounted } from '@/hooks/useMounted';
import { message } from 'antd';
import { formLayout } from '@/components/FormHelper/utils';
import { EnumTransModelType } from '@/enum';

const FormItem = Form.Item;

export type ProjectInfoFormProps = {
  basicInfo: any;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<any>;
};

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = (props) => {
  const { basicInfo, onSubmit: handleUpdate, onCancel } = props;
  const { type, modelType } = basicInfo;

  const isMounted = useMounted();
  const [formVals, setFormVals] = useState<any>(basicInfo);
  const [saveLoading, setSaveLoading] = useState(false);
  const [form] = Form.useForm();

  const handleConfirm = async () => {
    const fieldsValue = await form.validateFields();
    const columnsValue = { ...fieldsValue, isUnique: 1 };
    setFormVals({ ...formVals, ...columnsValue });
    setSaveLoading(true);
    try {
      await handleUpdate({ ...formVals, ...columnsValue });
      if (isMounted()) {
        setSaveLoading(false);
      }
    } catch (error) {
      message.error('An error occurred in the interface call');
      setSaveLoading(false);
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

  const titleRender = () => {
    let str = EnumTransModelType[modelType];
    if (type === 'top') {
      str += 'top';
    } else if (modelType === 'add') {
      str += 'child';
    }
    str += 'Subject domain';
    return str;
  };

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={titleRender()}
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
        {type !== 'top' && modelType === 'add' && (
          <FormItem name="parentName" label="Parent topic domain name">
            <Input disabled placeholder="Parent topic domain name" />
          </FormItem>
        )}
        <FormItem
          name="name"
          label="Subject domain name"
          rules={[{ required: true, message: 'Please enter a subject domain name!' }]}
        >
          <Input placeholder="Subject domain names are not repeatable" />
        </FormItem>
        <FormItem
          name="bizName"
          label="Business Nmae"
          rules={[{ required: true, message: 'Please enter the English name of the subject domain!' }]}
        >
          <Input placeholder="Please enter the English name of the subject field" />
        </FormItem>
        <FormItem name="description" label="Subject field description" hidden={true}>
          <Input.TextArea placeholder="Subject field description" />
        </FormItem>
        <FormItem name="isUnique" label="Is unique" hidden={true}>
          <Switch size="small" checked={true} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default ProjectInfoForm;
