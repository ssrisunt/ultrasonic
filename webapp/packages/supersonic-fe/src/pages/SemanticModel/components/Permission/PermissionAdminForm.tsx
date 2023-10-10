import React, { useState, useEffect } from 'react';
import { Form, Input, Switch, message } from 'antd';
import SelectPartner from '@/components/SelectPartner';
import SelectTMEPerson from '@/components/SelectTMEPerson';
import { connect } from 'umi';
import type { Dispatch } from 'umi';
import type { StateType } from '../../model';
import FormItemTitle from '@/components/FormHelper/FormItemTitle';
import { updateDomain, updateModel, getDomainDetail, getModelDetail } from '../../service';

import styles from '../style.less';
type Props = {
  permissionTarget: 'model' | 'domain';
  dispatch: Dispatch;
  domainManger: StateType;
  onSubmit?: (data?: any) => void;
  onValuesChange?: (value, values) => void;
};

const FormItem = Form.Item;

const PermissionAdminForm: React.FC<Props> = ({
  permissionTarget,
  domainManger,
  onValuesChange,
}) => {
  const [form] = Form.useForm();
  const [isOpenState, setIsOpenState] = useState<boolean>(true);
  const [classDetail, setClassDetail] = useState<any>({});
  const { selectModelId: modelId, selectDomainId } = domainManger;
  const { APP_TARGET } = process.env;

  const queryClassDetail = async () => {
    const selectId = permissionTarget === 'model' ? modelId : selectDomainId;
    const { code, msg, data } = await (permissionTarget === 'model'
      ? getModelDetail
      : getDomainDetail)({ modelId: selectId });
    if (code === 200) {
      setClassDetail(data);
      const fieldsValue = {
        ...data,
      };
      fieldsValue.admins = fieldsValue.admins || [];
      fieldsValue.adminOrgs = fieldsValue.adminOrgs || [];
      fieldsValue.viewers = fieldsValue.viewers || [];
      fieldsValue.viewOrgs = fieldsValue.viewOrgs || [];
      fieldsValue.isOpen = !!fieldsValue.isOpen;
      setIsOpenState(fieldsValue.isOpen);
      form.setFieldsValue(fieldsValue);
      return;
    }
    message.error(msg);
  };

  useEffect(() => {
    queryClassDetail();
  }, [modelId]);

  const saveAuth = async () => {
    const values = await form.validateFields();
    const { admins, adminOrgs, isOpen, viewOrgs = [], viewers = [] } = values;
    const queryClassData = {
      ...classDetail,
      admins,
      adminOrgs,
      viewOrgs,
      viewers,
      isOpen: isOpen ? 1 : 0,
    };
    const { code, msg } = await (permissionTarget === 'model' ? updateModel : updateDomain)(
      queryClassData,
    );
    if (code === 200) {
      return;
    }
    message.error(msg);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(value, values) => {
          const { isOpen } = value;
          if (isOpen !== undefined) {
            setIsOpenState(isOpen);
          }
          saveAuth();
          onValuesChange?.(value, values);
        }}
        className={styles.form}
      >
        <FormItem hidden={true} name="groupId" label="ID">
          <Input placeholder="groupId" />
        </FormItem>
        <FormItem
          name="admins"
          label={
            <FormItemTitle title={'Administrator'} subTitle={'Administrators will have all editing and access rights under the topic domain'} />
          }
        >
          <SelectTMEPerson placeholder="Please invite team members" />
        </FormItem>
        {APP_TARGET === 'inner' && (
          <FormItem name="adminOrgs" label="ByOrganization">
            <SelectPartner
              type="selectedDepartment"
              treeSelectProps={{
                placeholder: 'Please select the department that needs authorization',
              }}
            />
          </FormItem>
        )}
        <Form.Item
          label={
            <FormItemTitle
              title={'Make public'}
              subTitle={
                'After disclosure, all users will be able to use low/medium sensitivity resources under the topic domain, and high sensitivity resources need to be authorized through the resource list'
              }
            />
          }
          name="isOpen"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {!isOpenState && (
          <>
            {APP_TARGET === 'inner' && (
              <FormItem name="viewOrgs" label="By organization">
                <SelectPartner
                  type="selectedDepartment"
                  treeSelectProps={{
                    placeholder: 'Please select the ministry that requires authorization门',
                  }}
                />
              </FormItem>
            )}
            <FormItem name="viewers" label="By Individual">
              <SelectTMEPerson placeholder="Please select the individual who needs authorization" />
            </FormItem>
          </>
        )}
      </Form>
    </>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(PermissionAdminForm);
