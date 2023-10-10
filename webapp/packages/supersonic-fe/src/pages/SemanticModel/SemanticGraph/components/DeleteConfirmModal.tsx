import { Modal, message } from 'antd';
import React, { useState } from 'react';
import { SemanticNodeType } from '../../enum';
import { deleteDimension, deleteMetric, deleteDatasource } from '../../service';

type Props = {
  nodeData: any;
  onOkClick: () => void;
  onCancelClick: () => void;
  open: boolean;
};

const DeleteConfirmModal: React.FC<Props> = ({
  nodeData,
  onOkClick,
  onCancelClick,
  open = false,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const deleteNode = async () => {
    const { id, nodeType } = nodeData;
    let deleteQuery;
    if (nodeType === SemanticNodeType.DIMENSION) {
      deleteQuery = deleteDimension;
    }
    if (nodeType === SemanticNodeType.METRIC) {
      deleteQuery = deleteMetric;
    }
    if (nodeType === SemanticNodeType.DATASOURCE) {
      deleteQuery = deleteDatasource;
    }
    if (!deleteQuery) {
      message.error('The current node type is not one of the dimensions, indicators, or data sources, please confirm the node data');
      return;
    }
    setConfirmLoading(true);
    const { code, msg } = await deleteQuery(id);
    setConfirmLoading(false);
    if (code === 200) {
      onOkClick();
      message.success('Deleted successfully!');
    } else {
      message.error(msg);
    }
  };

  const handleOk = () => {
    deleteNode();
  };

  return (
    <>
      <Modal
        title={'Delete confirmation'}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={onCancelClick}
      >
        <>
          <span style={{ color: '#296DF3', fontWeight: 'bold' }}>{nodeData?.name}</span>
          Will be deleted, do you want to confirm?
        </>
      </Modal>
    </>
  );
};

export default DeleteConfirmModal;
