import React, { useEffect, useState } from 'react';
import { Modal, Select, Form, Input, InputNumber, message, Button, Radio } from 'antd';
import { getDimensionList, getModelList, savePlugin } from './service';
import {
  DimensionType,
  ModelType,
  ParamTypeEnum,
  ParseModeEnum,
  PluginType,
  FunctionParamFormItemType,
  PluginTypeEnum,
} from './type';
import { getLeafList, uuid } from '@/utils/utils';
import styles from './style.less';
import { PLUGIN_TYPE_MAP } from './constants';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';

const FormItem = Form.Item;
const { TextArea } = Input;

type Props = {
  detail?: PluginType;
  onSubmit: (values: any) => void;
  onCancel: () => void;
};

const DetailModal: React.FC<Props> = ({ detail, onSubmit, onCancel }) => {
  const [modelList, setModelList] = useState<ModelType[]>([]);
  const [modelDimensionList, setModelDimensionList] = useState<Record<number, DimensionType[]>>({});
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pluginType, setPluginType] = useState<PluginTypeEnum>();
  const [functionName, setFunctionName] = useState<string>();
  const [functionParams, setFunctionParams] = useState<FunctionParamFormItemType[]>([]);
  const [examples, setExamples] = useState<{ id: string; question?: string }[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [form] = Form.useForm();

  const initModelList = async () => {
    const res = await getModelList();
    setModelList([{ id: -1, name: '默认' }, ...getLeafList(res.data)]);
  };

  useEffect(() => {
    initModelList();
  }, []);

  const initModelDimensions = async (params: any) => {
    const modelIds = params
      .filter((param: any) => !!param.modelId)
      .map((param: any) => param.modelId);
    const res = await Promise.all(modelIds.map((modelId: number) => getDimensionList(modelId)));
    setModelDimensionList(
      modelIds.reduce((result: Record<number, DimensionType[]>, modelId: number, index: number) => {
        result[modelId] = res[index].data.list;
        return result;
      }, {}),
    );
  };

  useEffect(() => {
    if (detail) {
      const { paramOptions } = detail.config || {};
      const height = paramOptions?.find(
        (option: any) => option.paramType === 'FORWARD' && option.key === 'height',
      )?.value;
      form.setFieldsValue({
        ...detail,
        url: detail.config?.url,
        height,
      });
      if (paramOptions?.length > 0) {
        const params = paramOptions.filter(
          (option: any) => option.paramType !== ParamTypeEnum.FORWARD,
        );
        setFilters(params);
        initModelDimensions(params);
      }
      setPluginType(detail.type);
      const parseModeObj = JSON.parse(detail.parseModeConfig || '{}');
      setFunctionName(parseModeObj.name);
      const { properties } = parseModeObj.parameters || {};
      setFunctionParams(
        properties
          ? Object.keys(properties).map((key: string, index: number) => {
              return {
                id: `${index}`,
                name: key,
                type: properties[key].type,
                description: properties[key].description,
              };
            })
          : [],
      );
      setExamples(
        parseModeObj.examples
          ? parseModeObj.examples.map((item: string, index: number) => ({
              id: index,
              question: item,
            }))
          : [],
      );
    }
  }, [detail]);

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  const getFunctionParam = (description: string) => {
    return {
      name: functionName,
      description,
      parameters: {
        type: 'object',
        properties: functionParams
          .filter((param) => !!param.name?.trim())
          .reduce((acc, cur) => {
            acc[cur.name || ''] = {
              type: cur.type,
              description: cur.description,
            };
            return acc;
          }, {}),
        required: functionParams.filter((param) => !!param.name?.trim()).map((param) => param.name),
      },
      examples: examples
        .filter((example) => !!example.question?.trim())
        .map((example) => example.question),
    };
  };

  const onOk = async () => {
    const values = await form.validateFields();
    setConfirmLoading(true);
    let paramOptions = isArray(filters)
      ? filters?.filter(
          (filter) =>
            typeof filter === 'object' && (filter.paramType !== null || filter.value != null),
        )
      : [];
    paramOptions = paramOptions.concat([
      {
        paramType: ParamTypeEnum.FORWARD,
        key: 'height',
        value: values.height || undefined,
      },
    ]);
    const config = {
      url: values.url,
      paramOptions,
    };
    await savePlugin({
      ...values,
      id: detail?.id,
      modelList: isArray(values.modelList) ? values.modelList : [values.modelList],
      config: JSON.stringify(config),
      parseModeConfig: JSON.stringify(getFunctionParam(values.pattern)),
    });
    setConfirmLoading(false);
    onSubmit(values);
    message.success(detail?.id ? 'Edit Successful' : 'New Success');
  };

  const updateDimensionList = async (value: number) => {
    if (modelDimensionList[value]) {
      return;
    }
    const res = await getDimensionList(value);
    setModelDimensionList({ ...modelDimensionList, [value]: res.data.list });
  };

  return (
    <Modal
      open
      title={detail ? 'Edit Plugin/Model' : 'New Plugin/Model'}
      width={900}
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form {...layout} form={form} style={{ maxWidth: 820 }}>
        <FormItem name="modelList" label="Model List">
          <Select
            placeholder="Please select a Model"
            options={modelList.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
            }
            mode="multiple"
            allowClear
          />
        </FormItem>
        <FormItem
          name="name"
          label="Model name"
          rules={[{ required: true, message: 'Please enter a plug-in/model name' }]}
        >
          <Input placeholder="Please enter a plug-in/model name" allowClear />
        </FormItem>
        <FormItem
          name="type"
          label="Model type"
          rules={[{ required: true, message: 'Please select the plug-in/model type' }]}
        >
          <Select
            placeholder="Please select the plug-in/model type"
            options={Object.keys(PLUGIN_TYPE_MAP).map((key) => ({
              label: PLUGIN_TYPE_MAP[key],
              value: key,
            }))}
            onChange={(value) => {
              setPluginType(value);
              if (value === PluginTypeEnum.DSL) {
                form.setFieldsValue({ parseMode: ParseModeEnum.FUNCTION_CALL });
                setFunctionParams([
                  {
                    id: uuid(),
                    name: 'query_text',
                    type: 'string',
                    description: 'Text query',
                  },
                ]);
              }
            }}
          />
        </FormItem>
        <FormItem label="Function name">
          <Input
            value={functionName}
            onChange={(e) => {
              setFunctionName(e.target.value);
            }}
            placeholder="Please enter a function name that can only contain because of letters and underscores"
            allowClear
          />
        </FormItem>
        <FormItem name="pattern" label="Function description">
          <TextArea placeholder="Please enter a function description, separate multiple descriptions on a new line" allowClear />
        </FormItem>
        {/* <FormItem name="params" label="函数参数" hidden={pluginType === PluginTypeEnum.DSL}>
          <div className={styles.paramsSection}>
            {functionParams.map((functionParam: FunctionParamFormItemType) => {
              const { id, name, type, description } = functionParam;
              return (
                <div className={styles.filterRow} key={id}>
                  <Input
                    placeholder="参数名称"
                    value={name}
                    className={styles.filterParamName}
                    onChange={(e) => {
                      functionParam.name = e.target.value;
                      setFunctionParams([...functionParams]);
                    }}
                    allowClear
                  />
                  <Select
                    placeholder="参数类型"
                    options={[
                      { label: '字符串', value: 'string' },
                      { label: '整型', value: 'int' },
                    ]}
                    className={styles.filterParamValueField}
                    allowClear
                    value={type}
                    onChange={(value) => {
                      functionParam.type = value;
                      setFunctionParams([...functionParams]);
                    }}
                  />
                  <Input
                    placeholder="参数描述"
                    value={description}
                    className={styles.filterParamValueField}
                    onChange={(e) => {
                      functionParam.description = e.target.value;
                      setFunctionParams([...functionParams]);
                    }}
                    allowClear
                  />
                  <DeleteOutlined
                    onClick={() => {
                      setFunctionParams(functionParams.filter((item) => item.id !== id));
                    }}
                  />
                </div>
              );
            })}
            <Button
              onClick={() => {
                setFunctionParams([...functionParams, { id: uuid() }]);
              }}
            >
              <PlusOutlined />
              新增函数参数
            </Button>
          </div>
        </FormItem> */}
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
        {(pluginType === PluginTypeEnum.WEB_PAGE || pluginType === PluginTypeEnum.WEB_SERVICE) && (
          <>
            <FormItem name="url" label="Address" rules={[{ required: true, message: 'Please enter the URL' }]}>
              <Input placeholder="Please enter the URL" allowClear />
            </FormItem>
            <FormItem name="params" label="Function parameters">
              <div className={styles.paramsSection}>
                {filters.map((filter: any) => {
                  return (
                    <div className={styles.filterRow} key={filter.id}>
                      <Input
                        placeholder="Parameter name"
                        value={filter.key}
                        className={styles.filterParamName}
                        onChange={(e) => {
                          filter.key = e.target.value;
                          setFilters([...filters]);
                        }}
                        allowClear
                      />
                      <Radio.Group
                        onChange={(e) => {
                          filter.paramType = e.target.value;
                          setFilters([...filters]);
                        }}
                        value={filter.paramType}
                      >
                        <Radio value={ParamTypeEnum.SEMANTIC}>Semantic</Radio>
                        <Radio value={ParamTypeEnum.CUSTOM}>customization</Radio>
                      </Radio.Group>
                      {filter.paramType === ParamTypeEnum.CUSTOM && (
                        <Input
                          placeholder="Please enter"
                          value={filter.value}
                          className={styles.filterParamValueField}
                          onChange={(e) => {
                            filter.value = e.target.value;
                            setFilters([...filters]);
                          }}
                          allowClear
                        />
                      )}
                      {filter.paramType === ParamTypeEnum.SEMANTIC && (
                        <>
                          <Select
                            placeholder="Subject model"
                            options={modelList.map((model) => ({
                              label: model.name,
                              value: model.id,
                            }))}
                            showSearch
                            filterOption={(input, option) =>
                              ((option?.label ?? '') as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            className={styles.filterParamName}
                            allowClear
                            value={filter.modelId}
                            onChange={(value) => {
                              filter.modelId = value;
                              setFilters([...filters]);
                              updateDimensionList(value);
                            }}
                          />
                          <Select
                            placeholder="To select a dimension, you need to select a subject domain first"
                            options={(modelDimensionList[filter.modelId] || []).map(
                              (dimension) => ({
                                label: dimension.name,
                                value: `${dimension.id}`,
                              }),
                            )}
                            showSearch
                            className={styles.filterParamValueField}
                            filterOption={(input, option) =>
                              ((option?.label ?? '') as string)
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            allowClear
                            value={filter.elementId}
                            onChange={(value) => {
                              filter.elementId = value;
                              setFilters([...filters]);
                            }}
                          />
                        </>
                      )}
                      <DeleteOutlined
                        onClick={() => {
                          setFilters(filters.filter((item) => item.id !== filter.id));
                        }}
                      />
                    </div>
                  );
                })}
                <Button
                  onClick={() => {
                    setFilters([...filters, { id: uuid(), key: undefined, value: undefined }]);
                  }}
                >
                  <PlusOutlined />
                  新增参数
                </Button>
              </div>
            </FormItem>
          </>
        )}
        <FormItem name="height" label="Height">
          <InputNumber placeholder="Unit px" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default DetailModal;
