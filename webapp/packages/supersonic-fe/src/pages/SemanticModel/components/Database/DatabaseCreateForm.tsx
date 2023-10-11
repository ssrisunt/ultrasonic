import { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { message, Form, Input, Select, Button, Space } from 'antd';
import { saveDatabase, testDatabaseConnect } from '../../service';
import { formLayout } from '@/components/FormHelper/utils';
import SelectTMEPerson from '@/components/SelectTMEPerson';
import { ISemantic } from '../../data';

import styles from '../style.less';
type Props = {
  domainId?: number;
  dataBaseConfig?: ISemantic.IDatabaseItem;
  hideSubmitBtn?: boolean;
  onSubmit?: (params?: any) => void;
};

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const DatabaseCreateForm: ForwardRefRenderFunction<any, Props> = (
  { domainId, dataBaseConfig, onSubmit, hideSubmitBtn = false },
  ref,
) => {
  const [form] = Form.useForm();
  const [selectedDbType, setSelectedDbType] = useState<string>('h2');

  const [testLoading, setTestLoading] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
    if (dataBaseConfig) {
      form.setFieldsValue({ ...dataBaseConfig });
      setSelectedDbType(dataBaseConfig?.type);
    }
  }, [dataBaseConfig]);

  const getFormValidateFields = async () => {
    return await form.validateFields();
  };

  useImperativeHandle(ref, () => ({
    getFormValidateFields,
    saveDatabaseConfig,
    testDatabaseConnection,
  }));

  const saveDatabaseConfig = async () => {
    const values = await form.validateFields();
    const { code, msg } = await saveDatabase({
      ...dataBaseConfig,
      ...values,
      domainId,
    });

    if (code === 200) {
      message.success('Save successfully');
      onSubmit?.();
      return;
    }
    message.error(msg);
  };
  const testDatabaseConnection = async () => {
    const values = await form.validateFields();
    setTestLoading(true);
    const { code, data } = await testDatabaseConnect({
      ...values,
      domainId,
    });
    setTestLoading(false);
    if (code === 200 && data) {
      message.success('The connection test passed');
      return;
    }
    message.error('The connection test failed');
  };
  return (
    <>
      <Form
        {...formLayout}
        form={form}
        layout="vertical"
        className={styles.form}
        onValuesChange={(value) => {
          const { type } = value;
          if (type) {
            setSelectedDbType(type);
          }
        }}
      >
        <FormItem name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
          <Input placeholder="Please enter a database name" />
        </FormItem>
        <FormItem
          name="type"
          label="Database type"
          rules={[{ required: true, message: 'Please select a database type' }]}
        >
          <Select
            style={{ width: '100%' }}
            placeholder="Please select a database type"
            options={[
              { value: 'h2', label: 'h2' },
              { value: 'mysql', label: 'mysql' },
              { value: 'clickhouse', label: 'clickhouse' },
            ]}
          />
        </FormItem>
        {selectedDbType === 'h2' ? (
          <FormItem name="url" label="Link" rules={[{ required: true, message: 'Please enter the link' }]}>
            <Input placeholder="Please enter the link" />
          </FormItem>
        ) : (
          <>
            <FormItem name="host" label="host" rules={[{ required: true, message: 'Please enter the Host IP' }]}>
              <Input placeholder="Please enter the Host IP" />
            </FormItem>
            <FormItem
              name="port"
              label="port"
              rules={[{ required: true, message: 'Please enter the port number' }]}
            >
              <Input placeholder="Please enter the port number" />
            </FormItem>
          </>
        )}

        {selectedDbType === 'mysql' && (
          <FormItem
            name="version"
            label="Database version"
            rules={[{ required: true, message: 'Please select the database version' }]}
          >
            <Select
              style={{ width: '100%' }}
              placeholder="Please select the database version"
              options={[
                { value: '5.7', label: '5.7' },
                { value: '8.0', label: '8.0' },
              ]}
            />
          </FormItem>
        )}
        <FormItem
          name="username"
          label="User name"
          // rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="Please enter a username" />
        </FormItem>
        <FormItem name="password" label="Password">
          <Input.Password placeholder="Please enter a password" />
        </FormItem>
        <FormItem name="database" label="Database name">
          <Input placeholder="Please enter a database name" />
        </FormItem>
        <FormItem
          name="admins"
          label="Administrator"
          // rules={[{ required: true, message: '请设定数据库连接管理者' }]}
        >
          <SelectTMEPerson placeholder="Please invite team members" />
        </FormItem>
        <FormItem name="viewers" label="User">
          <SelectTMEPerson placeholder="Please invite team members" />
        </FormItem>

        <FormItem name="description" label="Description">
          <TextArea placeholder="Please enter a database description" style={{ height: 100 }} />
        </FormItem>
        {!hideSubmitBtn && (
          <FormItem>
            <Space>
              <Button
                type="primary"
                loading={testLoading}
                onClick={() => {
                  testDatabaseConnection();
                }}
              >
                Connection test
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  saveDatabaseConfig();
                }}
              >
                save
              </Button>
            </Space>
          </FormItem>
        )}
      </Form>
    </>
  );
};

export default forwardRef(DatabaseCreateForm);
