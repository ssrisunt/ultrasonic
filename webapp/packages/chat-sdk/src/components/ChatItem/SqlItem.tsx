import React, { useState } from 'react';
import { format } from 'sql-formatter';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { message } from 'antd';
import { PREFIX_CLS } from '../../common/constants';
import { CheckCircleFilled, UpOutlined } from '@ant-design/icons';
import { SqlInfoType } from '../../common/type';

type Props = {
  integrateSystem?: string;
  sqlInfo: SqlInfoType;
};

const SqlItem: React.FC<Props> = ({ integrateSystem, sqlInfo }) => {
  const [sqlType, setSqlType] = useState('');

  const tipPrefixCls = `${PREFIX_CLS}-item`;
  const prefixCls = `${PREFIX_CLS}-sql-item`;

  const handleCopy = (text, result) => {
    result ? message.success('Replication of SQL successful', 1) : message.error('Replication of SQL failed', 1);
  };

  const onCollapse = () => {
    setSqlType('');
  };

  if (!sqlInfo.llmParseSql && !sqlInfo.logicSql && !sqlInfo.querySql) {
    return null;
  }

  return (
    <div className={`${tipPrefixCls}-parse-tip`}>
      <div className={`${tipPrefixCls}-title-bar`}>
        <CheckCircleFilled className={`${tipPrefixCls}-step-icon`} />
        <div className={`${tipPrefixCls}-step-title`}>
          SQL generation
          {sqlType && (
            <span className={`${prefixCls}-toggle-expand-btn`} onClick={onCollapse}>
              <UpOutlined />
            </span>
          )}
        </div>
        <div className={`${prefixCls}-sql-options`}>
          {sqlInfo.llmParseSql && (
            <div
              className={`${prefixCls}-sql-option ${
                sqlType === 'llmParseSql' ? `${prefixCls}-sql-option-active` : ''
              }`}
              onClick={() => {
                setSqlType(sqlType === 'llmParseSql' ? '' : 'llmParseSql');
              }}
            >
              LLM parses SQL
            </div>
          )}
          {sqlInfo.logicSql && (
            <div
              className={`${prefixCls}-sql-option ${
                sqlType === 'logicSql' ? `${prefixCls}-sql-option-active` : ''
              }`}
              onClick={() => {
                setSqlType(sqlType === 'logicSql' ? '' : 'logicSql');
              }}
            >
              Logical SQL
            </div>
          )}
          {sqlInfo.querySql && (
            <div
              className={`${prefixCls}-sql-option ${
                sqlType === 'querySql' ? `${prefixCls}-sql-option-active` : ''
              }`}
              onClick={() => {
                setSqlType(sqlType === 'querySql' ? '' : 'querySql');
              }}
            >
              Physical SQL
            </div>
          )}
        </div>
      </div>
      <div
        className={`${prefixCls} ${
          !window.location.pathname.includes('/chat') &&
          integrateSystem &&
          integrateSystem !== 'wiki'
            ? `${prefixCls}-copilot`
            : ''
        }`}
      >
        {sqlType && (
          <>
            <SyntaxHighlighter
              className={`${prefixCls}-code`}
              language="sql"
              style={solarizedlight}
            >
              {format(sqlInfo[sqlType])}
            </SyntaxHighlighter>
            <CopyToClipboard
              text={format(sqlInfo[sqlType])}
              onCopy={(text, result) => handleCopy(text, result)}
            >
              <button className={`${prefixCls}-copy-btn`}>Copy The Code</button>
            </CopyToClipboard>
          </>
        )}
      </div>
    </div>
  );
};

export default SqlItem;
