import { Form, Modal, Input, Select, Button } from 'antd';
import {
  AgentToolType,
  AgentToolTypeEnum,
  AGENT_TOOL_TYPE_LIST,
  MetricOptionType,
  MetricType,
  ModelType,
  QUERY_MODE_LIST,
} from './type';
import { useEffect, useState } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './style.less';
import { getLeafList, uuid } from '@/utils/utils';
import { getMetricList, getModelList } from './service';
import { PluginType } from '../ChatPlugin/type';
import { getPluginList } from '../ChatPlugin/service';

const FormItem = Form.Item;

type Props = {
  editTool?: AgentToolType;
  onSaveTool: (tool: AgentToolType) => Promise<void>;
  onCancel: () => void;
};

const ToolModal: React.FC<Props> = ({ editTool, onSaveTool, onCancel }) => {
  const [toolType, setToolType] = useState<AgentToolTypeEnum>();
  const [modelList, setModelList] = useState<ModelType[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [examples, setExamples] = useState<{ id: string; question?: string }[]>([]);
  const [metricOptions, setMetricOptions] = useState<MetricOptionType[]>([]);
  const [modelMetricList, setModelMetricList] = useState<MetricType[]>([]);
  const [plugins, setPlugins] = useState<PluginType[]>([]);
  const [form] = Form.useForm();

  const initModelList = async () => {
    const res = await getModelList();
    setModelList([{ id: -1, name: 'Default' }, ...getLeafList(res.data)]);
  };

  const initPluginList = async () => {
    const res = await getPluginList({});
    setPlugins(res.data || []);
  };

  useEffect(() => {
    initModelList();
    initPluginList();
  }, []);

  const initModelMetrics = async (params: any) => {
    const res = await getMetricList(params[0].modelId);
    setModelMetricList(res.data.list);
  };

  useEffect(() => {
    if (editTool) {
      form.setFieldsValue({ ...editTool, plugins: editTool.plugins?.[0] });
      setToolType(editTool.type);
      setExamples(
        (editTool.exampleQuestions || []).map((item) => ({ id: uuid(), question: item })),
      );
      setMetricOptions(editTool.metricOptions || []);
      if (editTool.metricOptions && editTool.metricOptions.length > 0) {
        initModelMetrics(editTool.metricOptions || []);
      }
    } else {
      form.resetFields();
    }
  }, [editTool]);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const onOk = async () => {
    const values = await form.validateFields();
    setSaveLoading(true);
    await onSaveTool({
      id: editTool?.id,
      ...values,
      exampleQuestions: examples.map((item) => item.question).filter((item) => item),
      plugins: values.plugins ? [values.plugins] : undefined,
      metricOptions: metricOptions.map((item) => ({ ...item, modelId: values.modelId })),
    });
    setSaveLoading(false);
  };

  const updateMetricList = async (value: number) => {
    const res = await getMetricList(value);
    setModelMetricList(res.data.list);
  };

  return (
    <Modal
      open
      title={editTool ? 'Editing Tools' : 'Create a new tool'}
      confirmLoading={saveLoading}
      width={800}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form {...layout} form={form}>
        <FormItem name="type" label="Type" rules={[{ required: true, message: 'Please select the tool type' }]}>
          <Select
            options={AGENT_TOOL_TYPE_LIST}
            placeholder="Please select the tool type"
            onChange={setToolType}
          />
        </FormItem>
        <FormItem name="name" label="Name">
          <Input placeholder="Please enter a tool name" />
        </FormItem>
        {(toolType === AgentToolTypeEnum.RULE || toolType === AgentToolTypeEnum.DSL) && (
          <FormItem name="modelIds" label="Model ID">
            <Select
              options={modelList.map((model) => ({ label: model.name, value: model.id }))}
              placeholder="Please select a model"
              mode="multiple"
            />
          </FormItem>
        )}
        {toolType === AgentToolTypeEnum.DSL && (
          <FormItem name="exampleQuestions" label="Example question">
            <div className={styles.paramsSection}>
              {examples.map((example) => {
                const { id, question } = example;
                return (
                  <div className={styles.filterRow} key={id}>
                    <Input
                      placeholder="Example question"
                      value={question}
                      className={styles.questionExample}
                      onChange={(e) => {
                        example.question = e.target.value;
                        setExamples([...examples]);
                      }}
                      allowClear
                    />
                    <DeleteOutlined
                      onClick={() => {
                        setExamples(examples.filter((item) => item.id !== id));
                      }}
                    />
                  </div>
                );
              })}
              <Button
                onClick={() => {
                  setExamples([...examples, { id: uuid() }]);
                }}
              >
                <PlusOutlined />
                New sample question
              </Button>
            </div>
          </FormItem>
        )}
        {toolType === AgentToolTypeEnum.INTERPRET && (
          <>
            <FormItem name="modelId" label="Subject domain">
              <Select
                options={modelList.map((model) => ({ label: model.name, value: model.id }))}
                showSearch
                filterOption={(input, option) =>
                  ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Please select a subject field"
                onChange={(value) => {
                  setMetricOptions([...metricOptions]);
                  updateMetricList(value);
                }}
              />
            </FormItem>
            <FormItem name="params" label="Metric">
              <div className={styles.paramsSection}>
                {metricOptions.map((filter: any) => {
                  return (
                    <div className={styles.filterRow} key={filter.id}>
                      <Select
                        placeholder="To select an indicator, you need to select a subject domain first"
                        options={(modelMetricList || []).map((metric) => ({
                          label: metric.name,
                          value: `${metric.id}`,
                        }))}
                        showSearch
                        className={styles.filterParamValueField}
                        filterOption={(input, option) =>
                          ((option?.label ?? '') as string)
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        allowClear
                        value={filter.metricId}
                        onChange={(value) => {
                          filter.metricId = value;
                          setMetricOptions([...metricOptions]);
                        }}
                      />
                      <DeleteOutlined
                        onClick={() => {
                          setMetricOptions(metricOptions.filter((item) => item.id !== filter.id));
                        }}
                      />
                    </div>
                  );
                })}
                <Button
                  onClick={() => {
                    setMetricOptions([
                      ...metricOptions,
                      { id: uuid(), metricId: undefined, modelId: undefined },
                    ]);
                  }}
                >
                  <PlusOutlined />
                  New indicator
                </Button>
              </div>
            </FormItem>
          </>
        )}
        {toolType === AgentToolTypeEnum.PLUGIN && (
          <FormItem name="plugins" label="Plugins">
            <Select
              placeholder="Please select a plugin"
              options={plugins.map((plugin) => ({ label: plugin.name, value: plugin.id }))}
              showSearch
              filterOption={(input, option) =>
                ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
              }
              onChange={(value) => {
                const plugin = plugins.find((item) => item.id === value);
                if (plugin) {
                  form.setFieldsValue({ name: plugin.name });
                }
              }}
            />
          </FormItem>
        )}
        {toolType === AgentToolTypeEnum.RULE && (
          <FormItem name="queryModes" label="Query mode">
            <Select
              placeholder="Please select a query mode"
              options={QUERY_MODE_LIST}
              showSearch
              mode="multiple"
              filterOption={(input, option) =>
                ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </FormItem>
        )}
      </Form>
    </Modal>
  );
};

export default ToolModal;
