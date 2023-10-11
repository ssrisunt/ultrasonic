import { useState, forwardRef } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import { Form, Button } from 'antd';
import FormItemTitle from '@/components/FormHelper/FormItemTitle';
import { formLayout } from '@/components/FormHelper/utils';
import DimensionAndMetricVisibleModal from './DimensionAndMetricVisibleModal';
import { TransType } from '../../enum';
import { wrapperTransTypeAndId } from './utils';

type Props = {
  entityData: any;
  chatConfigKey: string;
  metricList: any[];
  dimensionList: any[];
  domainId: number;
  onSubmit: (params?: any) => void;
};

const FormItem = Form.Item;

const DimensionMetricVisibleForm: ForwardRefRenderFunction<any, Props> = ({
  domainId,
  metricList,
  dimensionList,
  entityData,
  chatConfigKey,
  onSubmit,
}) => {
  const [dimensionModalVisible, setDimensionModalVisible] = useState(false);
  return (
    <>
      <Form {...formLayout}>
        <FormItem
          label={
            <FormItemTitle title={'Visible dimensions/metrics'} subTitle={'After the settings are visible，will be allowed to be used in Q&A'} />
          }
        >
          <Button
            type="primary"
            onClick={() => {
              setDimensionModalVisible(true);
            }}
          >
           SetUp
          </Button>
        </FormItem>
      </Form>
      {dimensionModalVisible && (
        <DimensionAndMetricVisibleModal
          domainId={domainId}
          entityData={entityData}
          chatConfigKey={chatConfigKey}
          settingSourceList={[
            ...dimensionList.map((item) => {
              const transType = TransType.DIMENSION;
              const { id } = item;
              return {
                ...item,
                transType,
                key: wrapperTransTypeAndId(transType, id),
              };
            }),
            ...metricList.map((item) => {
              const transType = TransType.METRIC;
              const { id } = item;
              return {
                ...item,
                transType,
                key: wrapperTransTypeAndId(transType, id),
              };
            }),
          ]}
          visible={dimensionModalVisible}
          onCancel={() => {
            setDimensionModalVisible(false);
          }}
          onSubmit={(params) => {
            onSubmit?.();
            if (!params?.isSilenceSubmit) {
              setDimensionModalVisible(false);
            }
          }}
        />
      )}
    </>
  );
};

export default forwardRef(DimensionMetricVisibleForm);
