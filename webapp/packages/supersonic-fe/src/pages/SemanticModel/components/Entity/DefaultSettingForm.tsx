import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import FormItemTitle from '@/components/FormHelper/FormItemTitle';
import { formLayout } from '@/components/FormHelper/utils';
import { message, Form, Input, Select, Button, InputNumber } from 'antd';
import { addDomainExtend, editDomainExtend } from '../../service';
import {
  formatRichEntityDataListToIds,
  wrapperTransTypeAndId,
  splitListToTransTypeId,
} from './utils';
import styles from '../style.less';
import { ISemantic } from '../../data';
import { ChatConfigType, TransType, SemanticNodeType } from '../../enum';
import TransTypeTag from '../TransTypeTag';

type Props = {
  entityData: any;
  chatConfigKey: string;
  chatConfigType: ChatConfigType.DETAIL | ChatConfigType.AGG;
  metricList: ISemantic.IMetricItem[];
  dimensionList: ISemantic.IDimensionItem[];
  domainId: number;
  onSubmit: (params?: any) => void;
};

const FormItem = Form.Item;
const Option = Select.Option;

const DefaultSettingForm: ForwardRefRenderFunction<any, Props> = (
  { metricList, dimensionList, entityData, chatConfigKey, chatConfigType, onSubmit },
  ref,
) => {
  const [form] = Form.useForm();
  const [dataItemListOptions, setDataItemListOptions] = useState<any>([]);
  const formatEntityData = formatRichEntityDataListToIds(entityData);
  const getFormValidateFields = async () => {
    return await form.validateFields();
  };

  useImperativeHandle(ref, () => ({
    getFormValidateFields,
  }));

  useEffect(() => {
    form.resetFields();
    if (!entityData?.chatDefaultConfig) {
      return;
    }
    const { chatDefaultConfig, id } = formatEntityData;
    form.setFieldsValue({
      ...chatDefaultConfig,
      id,
    });
    if (chatConfigType === ChatConfigType.DETAIL) {
      initDataItemValue(chatDefaultConfig);
    }
  }, [entityData, dataItemListOptions]);

  const initDataItemValue = (chatDefaultConfig: {
    dimensionIds: number[];
    metricIds: number[];
  }) => {
    const { dimensionIds, metricIds } = chatDefaultConfig;
    const dimensionIdString = dimensionIds.map((dimensionId: number) => {
      return wrapperTransTypeAndId(TransType.DIMENSION, dimensionId);
    });
    const metricIdString = metricIds.map((metricId: number) => {
      return wrapperTransTypeAndId(TransType.METRIC, metricId);
    });
    form.setFieldsValue({
      dataItemIds: [...dimensionIdString, ...metricIdString],
    });
  };

  useEffect(() => {
    if (Array.isArray(dimensionList) && Array.isArray(metricList)) {
      const dimensionEnum = dimensionList.map((item: ISemantic.IDimensionItem) => {
        const { name, id, bizName } = item;
        return {
          name,
          label: (
            <>
              <TransTypeTag type={SemanticNodeType.DIMENSION} />
              {name}
            </>
          ),
          value: wrapperTransTypeAndId(TransType.DIMENSION, id),
          bizName,
          id,
          transType: TransType.DIMENSION,
        };
      });
      const metricEnum = metricList.map((item: ISemantic.IMetricItem) => {
        const { name, id, bizName } = item;
        return {
          name,
          label: (
            <>
              <TransTypeTag type={SemanticNodeType.METRIC} />
              {name}
            </>
          ),
          value: wrapperTransTypeAndId(TransType.METRIC, id),
          bizName,
          id,
          transType: TransType.METRIC,
        };
      });
      setDataItemListOptions([...dimensionEnum, ...metricEnum]);
    }
  }, [dimensionList, metricList]);

  const saveEntity = async () => {
    const values = await form.validateFields();
    const { id, dataItemIds } = values;
    let dimensionConfig = {};
    if (dataItemIds) {
      const { dimensionIds, metricIds } = splitListToTransTypeId(dataItemIds);
      dimensionConfig = {
        dimensionIds,
        metricIds,
      };
    }
    let saveDomainExtendQuery = addDomainExtend;
    if (id) {
      saveDomainExtendQuery = editDomainExtend;
    }
    const params = {
      ...formatEntityData,
      chatDefaultConfig: { ...values, ...dimensionConfig },
    };
    const { modelId } = entityData;
    const { code, msg, data } = await saveDomainExtendQuery({
      [chatConfigKey]: params,
      modelId,
      id,
    });
    if (code === 200) {
      form.setFieldValue('id', data);
      onSubmit?.();
      message.success('保存成功');
      return;
    }
    message.error(msg);
  };

  return (
    <>
      <Form
        {...formLayout}
        form={form}
        layout="vertical"
        className={styles.form}
        initialValues={{
          unit: 7,
          period: 'DAY',
          timeMode: 'LAST',
        }}
      >
        <FormItem hidden={true} name="id" label="ID">
          <Input placeholder="id" />
        </FormItem>

        {chatConfigType === ChatConfigType.DETAIL && (
          <FormItem name="dataItemIds" label="Display dimensions/metrics">
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              optionLabelProp="name"
              filterOption={(inputValue: string, item: any) => {
                const { name } = item;
                if (name.includes(inputValue)) {
                  return true;
                }
                return false;
              }}
              placeholder="Please select Display dimension/metric information"
              options={dataItemListOptions}
            />
          </FormItem>
        )}
        {chatConfigType === ChatConfigType.AGG && (
          <>
            {/* <FormItem
              name="metricIds"
              label={
                <FormItemTitle
                  title={'Limited Terms'}
                  subTitle={'问答搜索结果选择中，如果没有指定指标，将会采用默认指标进行展示'}
                />
              }
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                filterOption={(inputValue: string, item: any) => {
                  const { label } = item;
                  if (label.includes(inputValue)) {
                    return true;
                  }
                  return false;
                }}
                placeholder="请选择展示指标信息"
                options={metricListOptions}
              />
            </FormItem>
            <FormItem
              name="ratioMetricIds"
              label={
                <FormItemTitle
                  title={'同环比指标'}
                  subTitle={'问答搜索含有指定的指标，将会同时计算该指标最后一天的同环比'}
                />
              }
            >
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                filterOption={(inputValue: string, item: any) => {
                  const { label } = item;
                  if (label.includes(inputValue)) {
                    return true;
                  }
                  return false;
                }}
                placeholder="请选择同环比指标"
                options={metricListOptions}
              />
            </FormItem> */}
          </>
        )}
        <FormItem
          label={
            <FormItemTitle
              title={'Time range'}
              subTitle={'In Q&A search result selection, if no time range is specified, the default time range will be used'}
            />
          }
        >
          <Input.Group compact>
            {chatConfigType === ChatConfigType.DETAIL ? (
              <span
                style={{
                  display: 'inline-block',
                  lineHeight: '32px',
                  marginRight: '8px',
                }}
              >
                Previous
              </span>
            ) : (
              <>
                <FormItem name={'timeMode'} noStyle>
                  <Select style={{ width: '90px' }}>
                    <Option value="LAST">Last</Option>
                    <Option value="RECENT">Recent</Option>
                  </Select>
                </FormItem>
              </>
            )}
            <FormItem name={'unit'} noStyle>
              <InputNumber style={{ width: '120px' }} />
            </FormItem>
            <FormItem name={'period'} noStyle>
              <Select style={{ width: '90px' }}>
                <Option value="DAY">Day</Option>
                <Option value="WEEK">Week</Option>
                <Option value="MONTH">Month</Option>
                <Option value="YEAR">Year</Option>
              </Select>
            </FormItem>
          </Input.Group>
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            onClick={() => {
              saveEntity();
            }}
          >
            Save
          </Button>
        </FormItem>
      </Form>
    </>
  );
};

export default forwardRef(DefaultSettingForm);
