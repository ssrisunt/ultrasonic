import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Form, Input } from 'antd';
import type { ForwardRefRenderFunction } from 'react';
import SelectPartner from '@/components/SelectPartner';
import SelectTMEPerson from '@/components/SelectTMEPerson';
import { formLayout } from '@/components/FormHelper/utils';
import styles from '../style.less';
type Props = {
  permissonData: any;
  onSubmit?: (data?: any) => void;
  onValuesChange?: (value, values) => void;
};

const FormItem = Form.Item;

const PermissionCreateForm: ForwardRefRenderFunction<any, Props> = (
  { permissonData, onValuesChange },
  ref,
) => {
  const { APP_TARGET } = process.env;
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    formRef: form,
  }));

  useEffect(() => {
    const fieldsValue = {
      ...permissonData,
    };
    fieldsValue.authorizedDepartmentIds = permissonData.authorizedDepartmentIds || [];
    fieldsValue.authorizedUsers = permissonData.authorizedUsers || [];
    form.setFieldsValue(fieldsValue);
  }, [permissonData]);

  return (
    <>
      <Form
        {...formLayout}
        key={permissonData.groupId}
        form={form}
        layout="vertical"
        onValuesChange={(value, values) => {
          onValuesChange?.(value, values);
        }}
        className={styles.form}
      >
        <FormItem hidden={true} name="groupId" label="ID">
          <Input placeholder="groupId" />
        </FormItem>
        <FormItem name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
          <Input placeholder="Please enter a name" />
        </FormItem>
        {APP_TARGET === 'inner' && (
          <FormItem name="authorizedDepartmentIds" label="By organization">
            <SelectPartner
              type="selectedDepartment"
              treeSelectProps={{
                placeholder: 'Please select the department that needs authorization',
              }}
            />
          </FormItem>
        )}

        <FormItem name="authorizedUsers" label="By Individual">
          <SelectTMEPerson placeholder="Please select the individual who needs authorization" />
        </FormItem>
      </Form>
    </>
  );
};

export default forwardRef(PermissionCreateForm);
