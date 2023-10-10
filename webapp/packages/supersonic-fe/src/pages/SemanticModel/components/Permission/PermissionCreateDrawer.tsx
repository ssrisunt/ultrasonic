import React, { useEffect, useState, useRef } from 'react';
import { Button, message, Form, Space, Drawer, Input } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { connect } from 'umi';
import { createGroupAuth, updateGroupAuth } from '../../service';
import PermissionCreateForm from './PermissionCreateForm';
import type { StateType } from '../../model';
import SqlEditor from '@/components/SqlEditor';
import { TransType } from '../../enum';
import DimensionMetricVisibleTransfer from '../Entity/DimensionMetricVisibleTransfer';
import { wrapperTransTypeAndId } from '../Entity/utils';
import styles from '../style.less';

type Props = {
  domainManger: StateType;
  permissonData: any;
  onCancel: () => void;
  visible: boolean;
  onSubmit: (params?: any) => void;
};
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const PermissionCreateDrawer: React.FC<Props> = ({
  domainManger,
  visible,
  permissonData,
  onCancel,
  onSubmit,
}) => {
  const { dimensionList, metricList, selectModelId: modelId } = domainManger;
  const [form] = Form.useForm();
  const basicInfoFormRef = useRef<any>(null);
  const [selectedDimensionKeyList, setSelectedDimensionKeyList] = useState<string[]>([]);
  const [selectedMetricKeyList, setSelectedMetricKeyList] = useState<string[]>([]);

  const [selectedKeyList, setSelectedKeyList] = useState<string[]>([]);

  const saveAuth = async () => {
    const basicInfoFormValues = await basicInfoFormRef.current.formRef.validateFields();
    const values = await form.validateFields();
    const { dimensionFilters, dimensionFilterDescription } = values;

    const { authRules = [] } = permissonData;
    let target = authRules?.[0];
    if (!target) {
      target = { dimensions: dimensionList };
    } else {
      target.dimensions = dimensionList;
    }
    permissonData.authRules = [target];

    let saveAuthQuery = createGroupAuth;
    if (basicInfoFormValues.groupId) {
      saveAuthQuery = updateGroupAuth;
    }
    const { code, msg } = await saveAuthQuery({
      ...basicInfoFormValues,
      dimensionFilters: [dimensionFilters],
      dimensionFilterDescription,
      authRules: [
        {
          dimensions: selectedDimensionKeyList,
          metrics: selectedMetricKeyList,
        },
      ],
      modelId,
    });

    if (code === 200) {
      onSubmit?.();
      message.success('Save successfully');
      return;
    }
    message.error(msg);
  };

  useEffect(() => {
    form.resetFields();
    const { dimensionFilters, dimensionFilterDescription } = permissonData;
    form.setFieldsValue({
      dimensionFilterDescription,
      dimensionFilters: Array.isArray(dimensionFilters) ? dimensionFilters[0] || '' : '',
    });
    const dimensionAuth = permissonData?.authRules?.[0]?.dimensions || [];
    const metricAuth = permissonData?.authRules?.[0]?.metrics || [];
    setSelectedDimensionKeyList(dimensionAuth);
    setSelectedMetricKeyList(metricAuth);

    const dimensionKeys = dimensionList.reduce((dimensionChangeList: string[], item: any) => {
      if (dimensionAuth.includes(item.bizName)) {
        dimensionChangeList.push(wrapperTransTypeAndId(TransType.DIMENSION, item.id));
      }
      return dimensionChangeList;
    }, []);
    const metricKeys = metricList.reduce((metricChangeList: string[], item: any) => {
      if (metricAuth.includes(item.bizName)) {
        metricChangeList.push(wrapperTransTypeAndId(TransType.METRIC, item.id));
      }
      return metricChangeList;
    }, []);
    setSelectedKeyList([...dimensionKeys, ...metricKeys]);
  }, [permissonData]);

  const renderFooter = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={() => {
              saveAuth();
            }}
          >
            Finish
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <>
      <Drawer
        width={'100%'}
        className={styles.permissionDrawer}
        destroyOnClose
        title={'Group Permission'}
        maskClosable={false}
        open={visible}
        footer={renderFooter()}
        onClose={onCancel}
      >
        <div style={{ overflow: 'auto', margin: '0 auto', width: '1200px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size={20}>
            <ProCard title="Basic information" bordered>
              <PermissionCreateForm ref={basicInfoFormRef} permissonData={permissonData} />
            </ProCard>

            <ProCard title="Column permissions" bordered tooltip="Only authorize metrics/dimensions with high sensitivity">
              <DimensionMetricVisibleTransfer
                titles={['Unlicensed dimensions/metrics', 'Delegated Dimension/Metric']}
                sourceList={[
                  ...dimensionList
                    .map((item) => {
                      const transType = TransType.DIMENSION;
                      const { id } = item;
                      return {
                        ...item,
                        transType,
                        key: wrapperTransTypeAndId(transType, id),
                      };
                    })
                    .filter((item) => item.sensitiveLevel === 2),
                  ...metricList
                    .map((item) => {
                      const transType = TransType.METRIC;
                      const { id } = item;
                      return {
                        ...item,
                        transType,
                        key: wrapperTransTypeAndId(transType, id),
                      };
                    })
                    .filter((item) => item.sensitiveLevel === 2),
                ]}
                targetList={selectedKeyList}
                onChange={(newTargetKeys: string[]) => {
                  setSelectedKeyList(newTargetKeys);
                  const dimensionKeyChangeList = dimensionList.reduce(
                    (dimensionChangeList: string[], item: any) => {
                      if (
                        newTargetKeys.includes(wrapperTransTypeAndId(TransType.DIMENSION, item.id))
                      ) {
                        dimensionChangeList.push(item.bizName);
                      }
                      return dimensionChangeList;
                    },
                    [],
                  );
                  const metricKeyChangeList = metricList.reduce(
                    (metricChangeList: string[], item: any) => {
                      if (
                        newTargetKeys.includes(wrapperTransTypeAndId(TransType.METRIC, item.id))
                      ) {
                        metricChangeList.push(item.bizName);
                      }
                      return metricChangeList;
                    },
                    [],
                  );
                  setSelectedDimensionKeyList(dimensionKeyChangeList);
                  setSelectedMetricKeyList(metricKeyChangeList);
                }}
              />
            </ProCard>

            <ProCard bordered title="Row permissions">
              <div>
                <Form form={form} layout="vertical">
                  <FormItem name="dimensionFilters" label="Expression">
                    <SqlEditor height={'150px'} />
                  </FormItem>
                  <FormItem name="dimensionFilterDescription" label="Description">
                    <TextArea placeholder="Row permission description" />
                  </FormItem>
                </Form>
              </div>
            </ProCard>
          </Space>
        </div>
      </Drawer>
    </>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(PermissionCreateDrawer);
