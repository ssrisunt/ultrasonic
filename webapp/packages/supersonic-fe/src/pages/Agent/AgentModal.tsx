import { Form, Modal, Input, Button, Switch } from 'antd';
import { AgentType } from './type';
import { useEffect, useState } from 'react';
import styles from './style.less';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { uuid } from '@/utils/utils';

const FormItem = Form.Item;
const { TextArea } = Input;

type Props = {
  editAgent?: AgentType;
  onSaveAgent: (agent: AgentType) => Promise<void>;
  onCancel: () => void;
};

const AgentModal: React.FC<Props> = ({ editAgent, onSaveAgent, onCancel }) => {
  const [saveLoading, setSaveLoading] = useState(false);
  const [examples, setExamples] = useState<{ id: string; question?: string }[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (editAgent) {
      form.setFieldsValue({ ...editAgent, enableSearch: editAgent.enableSearch !== 0 });
      if (editAgent.examples) {
        setExamples(editAgent.examples.map((question) => ({ id: uuid(), question })));
      }
    } else {
      form.resetFields();
    }
  }, [editAgent]);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  const onOk = async () => {
    const values = await form.validateFields();
    setSaveLoading(true);
    await onSaveAgent({
      id: editAgent?.id,
      ...(editAgent || {}),
      ...values,
      examples: examples.map((example) => example.question),
      enableSearch: values.enableSearch ? 1 : 0,
    });
    setSaveLoading(false);
  };

  return (
    <Modal
      open
      title={editAgent ? 'Edit assistant' : 'Create a new assistant'}
      confirmLoading={saveLoading}
      width={800}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form {...layout} form={form} initialValues={{ enableSearch: true }}>
        <FormItem name="name" label="Name" rules={[{ required: true, message: 'Please enter the assistant name' }]}>
          <Input placeholder="Please enter the assistant name" />
        </FormItem>
        <FormItem name="enableSearch" label="Support Lenovo" valuePropName="checked">
          <Switch checkedChildren="Open" unCheckedChildren="Close" />
        </FormItem>
        <FormItem name="examples" label="Example question">
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
        <FormItem name="description" label="Description">
          <TextArea placeholder="Please enter a description for the assistant" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default AgentModal;
