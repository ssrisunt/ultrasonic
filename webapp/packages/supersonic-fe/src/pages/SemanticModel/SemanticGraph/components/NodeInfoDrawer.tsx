import {
  Button,
  Drawer,
  message,
  Row,
  Col,
  Divider,
  Tag,
  Space,
  Typography,
  Popconfirm,
} from 'antd';
import React, { useState, useEffect, ReactNode } from 'react';
import { SemanticNodeType } from '../../enum';
import { deleteDimension, deleteMetric, deleteDatasource } from '../../service';
import { connect } from 'umi';
import type { StateType } from '../../model';
import moment from 'moment';
import styles from '../style.less';
import TransTypeTag from '../../components/TransTypeTag';
import { MetricTypeWording } from '../../enum';
import { SENSITIVE_LEVEL_ENUM } from '../../constant';

const { Paragraph } = Typography;

type Props = {
  nodeData: any;
  domainManger: StateType;
  onNodeChange: (params?: { eventName?: string }) => void;
  onEditBtnClick?: (nodeData: any) => void;
  [key: string]: any;
};

interface DescriptionItemProps {
  title: string;
  content: React.ReactNode;
}

type InfoListItemChildrenItem = {
  label: string;
  value: string;
  content?: ReactNode;
  hideItem?: boolean;
};

type InfoListItem = {
  title: string;
  hideItem?: boolean;
  children: InfoListItemChildrenItem[];
};

const DescriptionItem = ({ title, content }: DescriptionItemProps) => (
  <div style={{ marginBottom: 7, fontSize: 14 }}>
    <Space>
      <span style={{ width: 'max-content' }}>{title}:</span>
      {content}
    </Space>
  </div>
);

const NodeInfoDrawer: React.FC<Props> = ({
  nodeData,
  domainManger,
  onNodeChange,
  onEditBtnClick,
  ...restProps
}) => {
  const [infoList, setInfoList] = useState<InfoListItem[]>([]);
  const { selectDomainName } = domainManger;
  useEffect(() => {
    if (!nodeData) {
      return;
    }
    const {
      alias,
      fullPath,
      bizName,
      createdBy,
      createdAt,
      updatedAt,
      description,
      domainName,
      sensitiveLevel,
      type,
      nodeType,
    } = nodeData;

    const list = [
      {
        title: 'Basic information',
        children: [
          {
            label: 'Field name',
            value: bizName,
          },
          {
            label: 'Alias',
            hideItem: !alias,
            value: alias || '-',
          },
          {
            label: 'The subject field to which it belongs',
            value: domainName,
            content: <Tag>{domainName || selectDomainName}</Tag>,
          },

          {
            label: 'Description',
            value: description,
          },
        ],
      },
      {
        title: 'App information',
        children: [
          // {
          //   label: '全路径',
          //   value: fullPath,
          //   content: (
          //     <Paragraph style={{ width: 275, margin: 0 }} ellipsis={{ tooltip: fullPath }}>
          //       {fullPath}
          //     </Paragraph>
          //   ),
          // },
          {
            label: 'Sensitivity',
            value: SENSITIVE_LEVEL_ENUM[sensitiveLevel],
          },
          // {
          //   label: '指标类型',
          //   value: MetricTypeWording[type],
          //   hideItem: nodeType !== SemanticNodeType.METRIC,
          // },
        ],
      },
      {
        title: 'Create information',
        children: [
          {
            label: 'Created by',
            value: createdBy,
          },
          {
            label: 'Creation time',
            value: createdAt ? moment(createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
          },
          {
            label: 'Update time',
            value: updatedAt ? moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
          },
        ],
      },
    ];

    const datasourceList = [
      {
        title: 'Basic information',
        children: [
          {
            label: 'Biz Name',
            value: bizName,
          },
          {
            label: 'Domain Name',
            value: domainName,
            content: <Tag>{domainName || selectDomainName}</Tag>,
          },
          {
            label: 'Description',
            value: description,
          },
        ],
      },
      {
        title: 'Create information',
        children: [
          {
            label: 'Created by',
            value: createdBy,
          },
          {
            label: 'Creation time',
            value: createdAt ? moment(createdAt).format('YYYY-MM-DD HH:mm:ss') : '',
          },
          {
            label: 'Update time',
            value: updatedAt ? moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
          },
        ],
      },
    ];

    setInfoList(nodeType === SemanticNodeType.DATASOURCE ? datasourceList : list);
  }, [nodeData]);

  const handleDeleteConfirm = async () => {
    let deleteQuery;
    if (nodeData?.nodeType === SemanticNodeType.METRIC) {
      deleteQuery = deleteMetric;
    }
    if (nodeData?.nodeType === SemanticNodeType.DIMENSION) {
      deleteQuery = deleteDimension;
    }
    if (nodeData?.nodeType === SemanticNodeType.DATASOURCE) {
      deleteQuery = deleteDatasource;
    }
    if (!deleteQuery) {
      return;
    }
    const { code, msg } = await deleteQuery(nodeData?.uid);
    if (code === 200) {
      onNodeChange?.({ eventName: nodeData?.nodeType });
    } else {
      message.error(msg);
    }
  };
  const extraNode = (
    <div className="ant-drawer-extra">
      <Space>
        <Button
          type="primary"
          key="editBtn"
          onClick={() => {
            onEditBtnClick?.(nodeData);
          }}
        >
          Edit
        </Button>

        <Popconfirm
          title="Confirm deletion?"
          okText="Ok"
          cancelText="Cancel"
          onConfirm={() => {
            handleDeleteConfirm();
          }}
        >
          <Button danger key="deleteBtn">
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
  return (
    <>
      <Drawer
        title={
          <Space>
            {nodeData?.name}
            <TransTypeTag type={nodeData?.nodeType} />
          </Space>
        }
        placement="right"
        mask={false}
        getContainer={false}
        footer={false}
        {...restProps}
      >
        <div key={nodeData?.id} className={styles.nodeInfoDrawerContent}>
          {infoList.map((item) => {
            const { children, title } = item;
            return (
              <div key={title} style={{ display: item.hideItem ? 'none' : 'block' }}>
                <p className={styles.title}>{title}</p>
                {children.map((childrenItem) => {
                  return (
                    <Row
                      key={`${childrenItem.label}-${childrenItem.value}`}
                      style={{ marginBottom: 10, display: childrenItem.hideItem ? 'none' : 'flex' }}
                    >
                      <Col span={24}>
                        <DescriptionItem
                          title={childrenItem.label}
                          content={childrenItem.content || childrenItem.value}
                        />
                      </Col>
                    </Row>
                  );
                })}
                <Divider />
              </div>
            );
          })}
        </div>
        {extraNode}
      </Drawer>
    </>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(NodeInfoDrawer);
