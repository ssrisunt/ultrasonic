import { getFormattedValue, isMobile } from '../../utils/utils';
import { Table } from 'antd';
import Avatar from 'antd/lib/avatar/avatar';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { queryEntities } from '../../service';
import { CLS_PREFIX } from '../../common/constants';
import IconFont from '../IconFont';
import classNames from 'classnames';

type Props = {
  entityId: string | number;
  modelId: number;
  modelName: string;
  onSelect: (option: string) => void;
};

const RecommendOptions: React.FC<Props> = ({ entityId, modelId, modelName, onSelect }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const prefixCls = `${CLS_PREFIX}-recommend-options`;

  const initData = async () => {
    setLoading(true);
    const res = await queryEntities(entityId, modelId);
    setLoading(false);
    setData(res.data);
  };

  useEffect(() => {
    if (entityId) {
      initData();
    }
  }, [entityId]);

  const getSectionOptions = () => {
    const basicColumn = {
      dataIndex: 'name',
      key: 'name',
      title: 'Basic information',
      render: (name: string, record: any) => {
        return (
          <div className={`${prefixCls}-item-name-column`}>
            <Avatar
              shape="square"
              icon={<IconFont type={modelName === 'Artist Library' ? 'icon-geshou' : 'icon-zhuanji'} />}
              src={record.url}
            />
            <div className={`${prefixCls}-entity-name`}>
              {name}
              {record.ver && record.ver !== 'Full version' && record.ver !== '-' && `(${record.ver})`}
              {record.singerName && ` - ${record.singerName}`}
            </div>
          </div>
        );
      },
    };

    const playCntColumnIdex = modelName.includes('歌曲')
      ? 'tme3platAvgLogYyPlayCnt'
      : 'tme3platJsPlayCnt';

    const columns = isMobile
      ? [basicColumn]
      : [
          basicColumn,
          modelName.includes('艺人')
            ? {
                dataIndex: 'onlineSongCnt',
                key: 'onlineSongCnt',
                title: 'Number of songs on the shelf',
                align: 'center',
                render: (onlineSongCnt: string) => {
                  return onlineSongCnt ? getFormattedValue(+onlineSongCnt) : '-';
                },
              }
            : {
                dataIndex: 'publishTime',
                key: 'publishTime',
                title: 'Release time',
                align: 'center',
                render: (publishTime: string) => {
                  return publishTime ? moment(publishTime).format('YYYY-MM-DD') : '-';
                },
              },
          {
            dataIndex: playCntColumnIdex,
            key: playCntColumnIdex,
            align: 'center',
            title: modelName.includes('Song') ? 'Average daily operating views in the past 7 days' : 'Yesterday\'s Settlement Views',
            render: (value: string) => {
              return value ? getFormattedValue(+value) : '-';
            },
          },
        ];

    return (
      <Table
        rowKey="id"
        columns={columns as any}
        dataSource={data}
        showHeader={!isMobile}
        size="small"
        pagination={false}
        loading={loading}
        className={`${prefixCls}-table`}
        rowClassName={`${prefixCls}-table-row`}
        onRow={record => {
          return {
            onClick: () => {
              onSelect(record.id);
            },
          };
        }}
      />
    );
  };

  const recommendOptionsClass = classNames(prefixCls, {
    [`${prefixCls}-mobile-mode`]: isMobile,
  });

  return <div className={recommendOptionsClass}>{getSectionOptions()}</div>;
};

export default RecommendOptions;
