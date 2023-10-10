import React, { useRef } from 'react';
import { Button, Modal } from 'antd';
import DimensionValueSettingForm from './DimensionValueSettingForm';

type Props = {
  initialValues: any;
  onCancel?: () => void;
  visible: boolean;
  onSubmit?: (params?: any) => void;
};
const DimensionValueSettingModal: React.FC<Props> = ({
  initialValues,
  visible,
  onCancel,
  onSubmit,
}) => {
  const formRef = useRef<any>();

  const handleSubmit = async () => {
    const formValues = await formRef.current.getFormValidateFields();
    onSubmit?.(formValues);
  };

  const renderFooter = () => {
    return (
      <>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          onClick={() => {
            handleSubmit();
          }}
        >
          Finish
        </Button>
      </>
    );
  };
  return (
    <>
      <Modal
        width={600}
        destroyOnClose
        title={'Dimension value settings'}
        maskClosable={false}
        open={visible}
        footer={renderFooter()}
        onCancel={onCancel}
      >
        <DimensionValueSettingForm initialValues={initialValues} ref={formRef} />
      </Modal>
    </>
  );
};

export default DimensionValueSettingModal;
