import React, { useState } from 'react';
import { Form, Button, Modal, Input } from 'antd';

import type { RegisterFormDetail } from './types';

export type RegisterFormProps = {
  onCancel: () => void;
  onSubmit: (values: RegisterFormDetail) => Promise<any>;
  createModalVisible: boolean;
};

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const { Item } = Form;

const RegisterForm: React.FC<RegisterFormProps> = (props) => {
  const [formVals, setFormVals] = useState<Partial<RegisterFormDetail>>({
    name: '', // Name
    password: '', // 密码
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [form] = Form.useForm();

  const { onSubmit: handleUpdate, onCancel, createModalVisible } = props;

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    setFormVals({ ...formVals, ...fieldsValue });
    setSaveLoading(true);
    const formValus = {
      ...formVals,
      ...fieldsValue,
    };
    try {
      await handleUpdate(formValus);
      setSaveLoading(false);
    } catch (error) {
      setSaveLoading(false);
    }
  };

  const renderFooter = () => {
    return (
      <>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" loading={saveLoading} onClick={handleSubmit}>
          完成注册
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={600}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title="User registration"
      open={createModalVisible}
      footer={renderFooter()}
      onCancel={onCancel}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          ...formVals,
        }}
      >
        <Item name="name" rules={[{ required: true }]} label="account">
          <Input size="large" placeholder="Please enter the account number" />
        </Item>
        <Item name="password" rules={[{ required: true, min: 6, max: 10 }]} label="Password">
          <Input size="large" type="password" placeholder="Please enter a password" />
        </Item>
        {/* <Item name="email" rules={[{ required: true, type: 'email' }]} label="邮箱地址">
          <Input size="large" type="email" placeholder="请输入邮箱地址" />
        </Item> */}
      </Form>
    </Modal>
  );
};

export default RegisterForm;
