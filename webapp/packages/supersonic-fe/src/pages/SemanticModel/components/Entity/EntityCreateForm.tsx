import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { message, Form, Input, Select, Button } from 'antd';
import { updateModel } from '../../service';
import type { ISemantic } from '../../data';
import { formLayout } from '@/components/FormHelper/utils';
import styles from '../style.less';

type Props = {
  modelData?: ISemantic.IModelItem;
  dimensionList: ISemantic.IDimensionList;
  modelId: number;
  onSubmit: () => void;
};

const FormItem = Form.Item;

const EntityCreateForm: ForwardRefRenderFunction<any, Props> = (
  { modelData, dimensionList, modelId, onSubmit },
  ref,
) => {
  const [form] = Form.useForm();
  const [dimensionListOptions, setDimensionListOptions] = useState<any>([]);
  const getFormValidateFields = async () => {
    return await form.validateFields();
  };

  useEffect(() => {
    form.resetFields();
    if (!modelData?.entity) {
      return;
    }
    const { entity } = modelData;
    form.setFieldsValue({
      ...entity,
      name: entity.names.join(','),
    });
  }, [modelData]);

  useImperativeHandle(ref, () => ({
    getFormValidateFields,
  }));

  useEffect(() => {
    const dimensionEnum = dimensionList.map((item: ISemantic.IDimensionItem) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    setDimensionListOptions(dimensionEnum);
  }, [dimensionList]);

  const saveEntity = async () => {
    const values = await form.validateFields();
    const { name = '' } = values;
    const { code, msg, data } = await updateModel({
      ...modelData,
      entity: {
        ...values,
        names: name.split(','),
      },
      id: modelId,
      modelId,
    });

    if (code === 200) {
      form.setFieldValue('id', data);
      onSubmit?.();
      message.success('Save successfully');
      return;
    }
    message.error(msg);
  };

  return (
    <>
      <Form {...formLayout} form={form} layout="vertical" className={styles.form}>
        <FormItem hidden={true} name="id" label="ID">
          <Input placeholder="id" />
        </FormItem>
        <FormItem name="name" label="Entity aliases">
          <Input placeholder="Please enter entity aliases, separated by commas" />
        </FormItem>
        <FormItem name="entityId" label="unique-identification">
          <Select
            allowClear
            style={{ width: '100%' }}
            // filterOption={(inputValue: string, item: any) => {
            //   const { label } = item;
            //   if (label.includes(inputValue)) {
            //     return true;
            //   }
            //   return false;
            // }}
            placeholder="Please select a principal ID"
            options={dimensionListOptions}
          />
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            onClick={() => {
              saveEntity();
            }}
          >
            Save Entity
          </Button>
        </FormItem>
      </Form>
    </>
  );
};

export default forwardRef(EntityCreateForm);
