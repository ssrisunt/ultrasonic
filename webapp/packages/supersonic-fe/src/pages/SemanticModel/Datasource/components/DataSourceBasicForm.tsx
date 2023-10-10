import React, { useEffect, useState } from 'react';
import { Form, Input, Spin, Select, message } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import { getDbNames, getTables } from '../../service';
import { ISemantic } from '../../data';

const FormItem = Form.Item;
const { TextArea } = Input;

type Props = {
  isEdit?: boolean;
  databaseConfigList: ISemantic.IDatabaseItemList;
  form: FormInstance<any>;
  mode?: 'normal' | 'fast';
};

const DataSourceBasicForm: React.FC<Props> = ({ isEdit, databaseConfigList, mode = 'normal' }) => {
  const [currentDbLinkConfigId, setCurrentDbLinkConfigId] = useState<number>();
  const [dbNameList, setDbNameList] = useState<any[]>([]);
  const [tableNameList, setTableNameList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const queryDbNameList = async (databaseId: number) => {
    setLoading(true);
    const { code, data, msg } = await getDbNames(databaseId);
    setLoading(false);
    if (code === 200) {
      const list = data?.resultList || [];
      setDbNameList(list);
    } else {
      message.error(msg);
    }
  };
  const queryTableNameList = async (databaseName: string) => {
    if (!currentDbLinkConfigId) {
      return;
    }
    setLoading(true);
    const { code, data, msg } = await getTables(currentDbLinkConfigId, databaseName);
    setLoading(false);
    if (code === 200) {
      const list = data?.resultList || [];
      setTableNameList(list);
    } else {
      message.error(msg);
    }
  };

  return (
    <Spin spinning={loading}>
      {mode === 'fast' && (
        <>
          <FormItem
            name="databaseId"
            label="Database connection"
            rules={[{ required: true, message: 'Please select a database connection' }]}
          >
            <Select
              showSearch
              placeholder="Please select a database connection"
              disabled={isEdit}
              onChange={(dbLinkConfigId: number) => {
                queryDbNameList(dbLinkConfigId);
                setCurrentDbLinkConfigId(dbLinkConfigId);
              }}
            >
              {databaseConfigList.map((item) => (
                <Select.Option key={item.id} value={item.id} disabled={!item.hasUsePermission}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            name="dbName"
            label="Database name"
            rules={[{ required: true, message: 'Please select a database/table' }]}
          >
            <Select
              showSearch
              placeholder="Please select a database connection first"
              disabled={isEdit}
              onChange={(dbName: string) => {
                queryTableNameList(dbName);
              }}
            >
              {dbNameList.map((item) => (
                <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            name="tableName"
            label="Data table name"
            rules={[{ required: true, message: 'Please select a database/table' }]}
          >
            <Select placeholder="Please select a database/table" disabled={isEdit} showSearch>
              {tableNameList.map((item) => (
                <Select.Option key={item.name} value={item.name}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </FormItem>
        </>
      )}

      <FormItem
        name="name"
        label="data source name"
        rules={[{ required: true, message: 'Please enter the data source name' }]}
      >
        <Input placeholder="Names are not repeatable" />
      </FormItem>
      <FormItem
        name="bizName"
        label="business data source"
        rules={[{ required: true, message: 'Please the business data source name' }]}
      >
        <Input placeholder="Names are not repeatable" disabled={isEdit} />
      </FormItem>
      <FormItem name="description" label="Data source description">
        <TextArea placeholder="Please enter a description of the data source" />
      </FormItem>
    </Spin>
  );
};

export default DataSourceBasicForm;
