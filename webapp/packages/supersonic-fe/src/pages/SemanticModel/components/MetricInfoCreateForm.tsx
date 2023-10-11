import React, { useEffect, useRef, useState } from 'react';
import {
  Form,
  Button,
  Modal,
  Steps,
  Input,
  Select,
  Radio,
  Switch,
  InputNumber,
  message,
  Result,
  Row,
  Col,
  Space,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import MetricMeasuresFormTable from './MetricMeasuresFormTable';
import { SENSITIVE_LEVEL_OPTIONS } from '../constant';
import { formLayout } from '@/components/FormHelper/utils';
import FormItemTitle from '@/components/FormHelper/FormItemTitle';
import styles from './style.less';
import { getMeasureListByModelId } from '../service';
import TableTitleTooltips from '../components/TableTitleTooltips';
import { creatExprMetric, updateExprMetric, mockMetricAlias, getMetricTags } from '../service';
import { ISemantic } from '../data';
import { history } from 'umi';

export type CreateFormProps = {
  datasourceId?: number;
  domainId: number;
  modelId: number;
  createModalVisible: boolean;
  metricItem: any;
  onCancel?: () => void;
  onSubmit?: (values: any) => void;
};

const { Step } = Steps;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

const MetricInfoCreateForm: React.FC<CreateFormProps> = ({
  datasourceId,
  domainId,
  modelId,
  onCancel,
  createModalVisible,
  metricItem,
  onSubmit,
}) => {
  const isEdit = !!metricItem?.id;
  const [currentStep, setCurrentStep] = useState(0);
  const formValRef = useRef({} as any);
  const [form] = Form.useForm();
  const updateFormVal = (val: any) => {
    const formVal = {
      ...formValRef.current,
      ...val,
    };
    formValRef.current = formVal;
  };

  const [classMeasureList, setClassMeasureList] = useState<ISemantic.IMeasure[]>([]);

  const [exprTypeParamsState, setExprTypeParamsState] = useState<ISemantic.IMeasure[]>([]);

  const [exprSql, setExprSql] = useState<string>('');

  const [isPercentState, setIsPercentState] = useState<boolean>(false);
  const [isDecimalState, setIsDecimalState] = useState<boolean>(false);
  const [hasMeasuresState, setHasMeasuresState] = useState<boolean>(true);
  const [llmLoading, setLlmLoading] = useState<boolean>(false);

  const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>([]);

  const forward = () => setCurrentStep(currentStep + 1);
  const backward = () => setCurrentStep(currentStep - 1);

  const queryClassMeasureList = async () => {
    const { code, data } = await getMeasureListByModelId(modelId);
    if (code === 200) {
      setClassMeasureList(data);
      if (datasourceId) {
        const hasMeasures = data.some(
          (item: ISemantic.IMeasure) => item.datasourceId === datasourceId,
        );
        setHasMeasuresState(hasMeasures);
      }
      return;
    }
    setClassMeasureList([]);
  };

  useEffect(() => {
    queryClassMeasureList();
    queryMetricTags();
  }, []);

  const handleNext = async () => {
    const fieldsValue = await form.validateFields();
    const submitForm = {
      ...formValRef.current,
      ...fieldsValue,
      typeParams: {
        expr: exprSql,
        measures: exprTypeParamsState,
      },
    };
    updateFormVal(submitForm);
    if (currentStep < 1) {
      forward();
    } else {
      await saveMetric(submitForm);
    }
  };

  const initData = () => {
    const {
      id,
      name,
      bizName,
      description,
      sensitiveLevel,
      typeParams: typeParams,
      dataFormat,
      dataFormatType,
      alias,
      tags,
    } = metricItem as any;
    const isPercent = dataFormatType === 'percent';
    const isDecimal = dataFormatType === 'decimal';
    const initValue = {
      id,
      name,
      bizName,
      sensitiveLevel,
      description,
      tags,
      // isPercent,
      dataFormatType: dataFormatType || '',
      alias: alias && alias.trim() ? alias.split(',') : [],
      dataFormat: dataFormat || {
        decimalPlaces: 2,
        needMultiply100: false,
      },
    };
    const editInitFormVal = {
      ...formValRef.current,
      ...initValue,
    };
    updateFormVal(editInitFormVal);
    form.setFieldsValue(initValue);
    setExprTypeParamsState(typeParams.measures);
    setExprSql(typeParams.expr);
    setIsPercentState(isPercent);
    setIsDecimalState(isDecimal);
  };

  useEffect(() => {
    if (isEdit) {
      initData();
    }
  }, [metricItem]);

  const saveMetric = async (fieldsValue: any) => {
    const queryParams = {
      modelId: isEdit ? metricItem.modelId : modelId,
      ...fieldsValue,
    };
    const { typeParams, alias, dataFormatType } = queryParams;
    queryParams.alias = Array.isArray(alias) ? alias.join(',') : '';
    if (!typeParams?.expr) {
      message.error('Please enter a metric expression');
      return;
    }
    if (!dataFormatType) {
      delete queryParams.dataFormat;
    }
    if (!(Array.isArray(typeParams?.measures) && typeParams.measures.length > 0)) {
      message.error('Please add a metric');
      return;
    }
    let saveMetricQuery = creatExprMetric;
    if (queryParams.id) {
      saveMetricQuery = updateExprMetric;
    }
    const { code, msg } = await saveMetricQuery(queryParams);
    if (code === 200) {
      message.success('Editing the metric succeeded');
      onSubmit?.(queryParams);
      return;
    }
    message.error(msg);
  };

  const generatorMetricAlias = async () => {
    setLlmLoading(true);
    const { code, data } = await mockMetricAlias({ ...metricItem });
    const formAlias = form.getFieldValue('alias');
    setLlmLoading(false);
    if (code === 200) {
      form.setFieldValue('alias', Array.from(new Set([...formAlias, ...data])));
    } else {
      message.error('Large language model parsing exceptions');
    }
  };

  const queryMetricTags = async () => {
    const { code, data } = await getMetricTags();
    if (code === 200) {
      // form.setFieldValue('alias', Array.from(new Set([...formAlias, ...data])));
      setTagOptions(
        Array.isArray(data)
          ? data.map((tag: string) => {
              return { label: tag, value: tag };
            })
          : [],
      );
    } else {
      message.error('Failed to get metric label');
    }
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <MetricMeasuresFormTable
          datasourceId={datasourceId}
          typeParams={{
            measures: exprTypeParamsState,
            expr: exprSql,
          }}
          measuresList={classMeasureList}
          onFieldChange={(typeParams: any) => {
            setExprTypeParamsState([...typeParams]);
          }}
          onSqlChange={(sql: string) => {
            setExprSql(sql);
          }}
        />
      );
    }

    return (
      <>
        <FormItem hidden={true} name="id" label="ID">
          <Input placeholder="id" />
        </FormItem>
        <FormItem
          name="name"
          label="Metric name"
          rules={[{ required: true, message: 'Please enter a name for the metric' }]}
        >
          <Input placeholder="Names are not repeatable" />
        </FormItem>
        <FormItem
          name="bizName"
          label="Field name"
          rules={[{ required: true, message: 'Please enter a field name' }]}
        >
          <Input placeholder="Names are not repeatable" disabled={isEdit} />
        </FormItem>
        <FormItem label="Alias">
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
                  loading={llmLoading}
                  size="small"
                  style={{ top: '2px' }}
                  onClick={() => {
                    generatorMetricAlias();
                  }}
                >
                  <Space>
                    Smart fill
                    <Tooltip title="Smart Fill will use a large language model to get metric aliases based on information about the metric">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                </Button>
              </Col>
            )}
          </Row>
        </FormItem>
        <FormItem name="tags" label="Label">
          <Select
            mode="tags"
            placeholder="Enter after entering the alias to confirm, multi-alias input, copy and paste support automatic separation of English commas"
            tokenSeparators={[',']}
            maxTagCount={9}
            options={tagOptions}
          />
        </FormItem>
        <FormItem
          name="sensitiveLevel"
          label="Sensitivity"
          rules={[{ required: true, message: 'Please select a sensitivity' }]}
        >
          <Select placeholder="Please select a sensitivity">
            {SENSITIVE_LEVEL_OPTIONS.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </FormItem>
        <FormItem
          name="description"
          label={
            <TableTitleTooltips
              title="Business caliber"
              overlayInnerStyle={{ width: 600 }}
              tooltips={
                <>
                  <p>
                   When entering indicators, please be sure to fill in the indicator caliber in detail. Aperture descriptions are essential to understand the meaning of the indicator, how it is calculated, and when it is used. A clear, accurate description can help other users better understand and use the indicator, avoiding misunderstandings that lead to wrong data analysis and decision-making. When filling in the caliber, it is recommended to include the following information：
                  </p>
                  <p>1. How the indicator is calculated: Detail how the indicator is calculated, including the formulas involved, calculation steps, etc.</p>
                  <p>2. Data source: Describes the data source that the indicator depends on, including data tables, fields, and other information.</p>
                  <p>3. Usage scenarios: Describe which business scenarios the metric applies to and how it can be used in those scenarios.</p>
                  <p>4.Any other relevant information: e.g. frequency of data updates, data quality requirements, etc.</p>
                  <p>
                    Make sure the caliber description is clear, concise, and easy to understand so that other users can quickly grasp the core points of the metric.
                  </p>
                </>
              }
            />
          }
          rules={[{ required: true, message: 'Please enter the service caliber' }]}
        >
          <TextArea placeholder="Please enter the service caliber" />
        </FormItem>
        <FormItem
          label={
            <FormItemTitle
              title={'Data formatting'}
              // subTitle={'开启后，指标数据展示时会根据配置进行格式化，如0.02 -> 2%'}
            />
          }
          name="dataFormatType"
        >
          <Radio.Group buttonStyle="solid" size="middle">
            <Radio.Button value="">Default</Radio.Button>
            <Radio.Button value="decimal">Decimal</Radio.Button>
            <Radio.Button value="percent">Percentage</Radio.Button>
          </Radio.Group>
        </FormItem>

        {/* <FormItem
          label={
            <FormItemTitle
              title={'是否展示为百分比'}
              subTitle={'开启后，指标数据展示时会根据配置进行格式化，如0.02 -> 2%'}
            />
          }
          name="isPercent"
          valuePropName="checked"
        >
          <Switch
            onChange={(checked) => {
              form.setFieldValue(['dataFormat', 'needMultiply100'], checked);
            }}
          />
        </FormItem> */}
        {(isPercentState || isDecimalState) && (
          <FormItem
            label={
              <FormItemTitle
                title={'Decimal places'}
                subTitle={`Set the number of decimal places, such as keeping two digits, 0.021252 -> 2.12${
                  isPercentState ? '%' : ''
                }`}
              />
            }
            name={['dataFormat', 'decimalPlaces']}
          >
            <InputNumber placeholder="Enter the number of decimal places you want to reserve" style={{ width: '300px' }} />
          </FormItem>
        )}
        {isPercentState && (
          <>
            <FormItem
              label={
                <FormItemTitle
                  title={'Whether the original value is multiplied 100'}
                  subTitle={'As in the original value 0.001 ->Impression value 0.1% '}
                />
              }
              name={['dataFormat', 'needMultiply100']}
              valuePropName="checked"
            >
              <Switch />
            </FormItem>
          </>
        )}
      </>
    );
  };
  const renderFooter = () => {
    if (!hasMeasuresState) {
      return <Button onClick={onCancel}>Cancel</Button>;
    }
    if (currentStep === 1) {
      return (
        <>
          <Button style={{ float: 'left' }} onClick={backward}>
            上一步
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleNext}>
            完成
          </Button>
        </>
      );
    }
    return (
      <>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleNext}>
          Next
        </Button>
      </>
    );
  };
  return (
    <Modal
      forceRender
      width={1300}
      style={{ top: 48 }}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={`${isEdit ? 'Edit' : 'New'}Index`}
      maskClosable={false}
      open={createModalVisible}
      footer={renderFooter()}
      onCancel={onCancel}
    >
      {hasMeasuresState ? (
        <>
          <Steps style={{ marginBottom: 28 }} size="small" current={currentStep}>
            <Step title="Basic information" />
            <Step title="Measurement information" />
          </Steps>
          <Form
            {...formLayout}
            form={form}
            initialValues={{
              ...formValRef.current,
              dataFormatType: '',
            }}
            onValuesChange={(value, values: any) => {
              const { isPercent, dataFormatType } = values;
              // if (isPercent !== undefined) {
              //   setIsPercentState(isPercent);
              // }
              if (dataFormatType === 'percent') {
                setIsPercentState(true);
                setIsDecimalState(false);
              }
              if (dataFormatType === 'decimal') {
                setIsPercentState(false);
                setIsDecimalState(true);
              }
              if (!dataFormatType) {
                setIsPercentState(false);
                setIsDecimalState(false);
              }
            }}
            className={styles.form}
          >
            {renderContent()}
          </Form>
        </>
      ) : (
        <Result
          status="warning"
          subTitle="The current data source is missing a measure and cannot be created. Go to Data Source Configuration and set the field to Measure"
          extra={
            <Button
              type="primary"
              key="console"
              onClick={() => {
                history.replace(`/model/${domainId}/${modelId}/dataSource`);
                onCancel?.();
              }}
            >
              Go to Create
            </Button>
          }
        />
      )}
    </Modal>
  );
};

export default MetricInfoCreateForm;
