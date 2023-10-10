import type { IGraphCommand } from '@antv/xflow';

/** 节点命令 */
export namespace CustomCommands {
  const category = 'Node operations';
  /** 异步请求demo */
  export const TEST_ASYNC_CMD: IGraphCommand = {
    id: 'xflow:async-cmd',
    label: 'Asynchronous requests',
    category,
  };
  /** 重命名节点弹窗 */
  export const SHOW_RENAME_MODAL: IGraphCommand = {
    id: 'xflow:rename-node-modal',
    label: 'Open the Rename pop-up window',
    category,
  };
  /** 二次确认弹窗 */
  export const SHOW_CONFIRM_MODAL: IGraphCommand = {
    id: 'xflow:confirm-modal',
    label: 'Open the secondary confirmation pop-up window',
    category,
  };
  /** 部署服务 */
  export const DEPLOY_SERVICE: IGraphCommand = {
    id: 'xflow:deploy-service',
    label: 'Deploy the service',
    category,
  };

  export const DATASOURCE_RELATION: IGraphCommand = {
    id: 'xflow:datasource-relation',
    label: 'Get data source relational data',
    category,
  };

  /** 查看维度 */
  export const VIEW_DIMENSION: IGraphCommand = {
    id: 'xflow:view-dimension',
    label: 'View dimensions',
    category,
  };
}
