import { PREFIX_CLS } from '../../../common/constants';

type Props = {
  model: string;
  onApplyAuth?: (model: string) => void;
};

const ApplyAuth: React.FC<Props> = ({ model, onApplyAuth }) => {
  const prefixCls = `${PREFIX_CLS}-apply-auth`;

  return (
    <div className={prefixCls}>
      No permission,
      {onApplyAuth ? (
        <span
          className={`${prefixCls}-apply`}
          onClick={() => {
            onApplyAuth(model);
          }}
        >
          点击申请
        </span>
      ) : (
        'Please contact your administrator to request permissions'
      )}
    </div>
  );
};

export default ApplyAuth;
