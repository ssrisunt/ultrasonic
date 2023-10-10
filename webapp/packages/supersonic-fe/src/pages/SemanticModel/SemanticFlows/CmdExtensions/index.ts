import { DeployDagCommand, NsDeployDagCmd } from './CmdDeploy';
import { RenameNodeCommand, NsRenameNodeCmd } from './CmdRenameNodeModal';
import { ConfirmModalCommand, NsConfirmModalCmd } from './CmdConfirmModal';
import {
  DataSourceRelationCommand,
  NsDataSourceRelationCmd,
} from './CmdUpdateDataSourceRelationList';
import type { ICommandContributionConfig } from '@antv/xflow';
/** Register as a command that can be executed */

export const COMMAND_CONTRIBUTIONS: ICommandContributionConfig[] = [
  {
    ...NsDeployDagCmd,
    CommandHandler: DeployDagCommand,
  },
  {
    ...NsRenameNodeCmd,
    CommandHandler: RenameNodeCommand,
  },
  {
    ...NsConfirmModalCmd,
    CommandHandler: ConfirmModalCommand,
  },
  {
    ...NsDataSourceRelationCmd,
    CommandHandler: DataSourceRelationCommand,
  },
];
