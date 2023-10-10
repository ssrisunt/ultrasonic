/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NsNodeCmd, NsEdgeCmd, IMenuOptions, NsGraph, NsGraphCmd } from '@antv/xflow';
import type { NsRenameNodeCmd } from './CmdExtensions/CmdRenameNodeModal';
import { createCtxMenuConfig, MenuItemType } from '@antv/xflow';
import { IconStore, XFlowNodeCommands, XFlowEdgeCommands, XFlowGraphCommands } from '@antv/xflow';
import { initDimensionGraphCmds } from './ConfigCmd';
import type { NsConfirmModalCmd } from './CmdExtensions/CmdConfirmModal';
import { NS_DATA_SOURCE_RELATION_MODAL_OPEN_STATE } from './ConfigModelService';
import { DeleteOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { CustomCommands } from './CmdExtensions/constants';
import { GraphApi } from './service';

/** menuitem 配置 */
export namespace NsMenuItemConfig {
  /**Register the icon that the menu depends on */
  IconStore.set('DeleteOutlined', DeleteOutlined);
  IconStore.set('EditOutlined', EditOutlined);
  IconStore.set('StopOutlined', StopOutlined);

  export const DELETE_EDGE: IMenuOptions = {
    id: XFlowEdgeCommands.DEL_EDGE.id,
    label: 'Delete an edge',
    iconName: 'DeleteOutlined',
    onClick: async (args) => {
      const { target, commandService, modelService } = args;
      await commandService.executeCommand<NsEdgeCmd.DelEdge.IArgs>(XFlowEdgeCommands.DEL_EDGE.id, {
        edgeConfig: target.data as NsGraph.IEdgeConfig,
      });
      // Save the data source association relationship
      await commandService.executeCommand(CustomCommands.DATASOURCE_RELATION.id, {});
      // Save the graph data
      commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
        XFlowGraphCommands.SAVE_GRAPH_DATA.id,
        { saveGraphDataService: (meta, graphData) => GraphApi.saveGraphData!(meta, graphData) },
      );
      // Close the Set Association Relationship pop-up window
      const modalModel = await modelService!.awaitModel(
        NS_DATA_SOURCE_RELATION_MODAL_OPEN_STATE.ID,
      );
      modalModel.setValue({ open: false });
    },
  };

  export const DELETE_NODE: IMenuOptions = {
    id: XFlowNodeCommands.DEL_NODE.id,
    label: 'Delete the node',
    iconName: 'DeleteOutlined',
    onClick: async ({ target, commandService }) => {
      commandService.executeCommand<NsNodeCmd.DelNode.IArgs>(XFlowNodeCommands.DEL_NODE.id, {
        nodeConfig: { id: target?.data?.id || '', targetData: target.data },
      });
    },
  };

  export const EMPTY_MENU: IMenuOptions = {
    id: 'EMPTY_MENU_ITEM',
    label: 'Not available',
    isEnabled: false,
    iconName: 'DeleteOutlined',
  };

  export const RENAME_NODE: IMenuOptions = {
    id: CustomCommands.SHOW_RENAME_MODAL.id,
    label: '重命名',
    isVisible: true,
    iconName: 'EditOutlined',
    onClick: async ({ target, commandService }) => {
      const nodeConfig = target.data as NsGraph.INodeConfig;
      commandService.executeCommand<NsRenameNodeCmd.IArgs>(CustomCommands.SHOW_RENAME_MODAL.id, {
        nodeConfig,
        updateNodeNameService: GraphApi.renameNode,
      });
    },
  };

  export const DELETE_DATASOURCE_NODE: IMenuOptions = {
    id: CustomCommands.SHOW_RENAME_MODAL.id,
    label: 'Delete the data source',
    isVisible: true,
    iconName: 'EditOutlined',
    onClick: async ({ target, commandService }) => {
      const nodeConfig = {
        ...target.data,
        modalProps: {
          title: 'Confirm deletion?',
        },
      } as NsGraph.INodeConfig;
      await commandService.executeCommand<NsConfirmModalCmd.IArgs>(
        CustomCommands.SHOW_CONFIRM_MODAL.id,
        {
          nodeConfig,
          confirmModalCallBack: async () => {
            await commandService.executeCommand<NsNodeCmd.DelNode.IArgs>(
              XFlowNodeCommands.DEL_NODE.id,
              {
                nodeConfig: {
                  id: target?.data?.id || '',
                  type: 'dataSource',
                  targetData: target.data,
                },
              },
            );
            commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
              XFlowGraphCommands.SAVE_GRAPH_DATA.id,
              {
                saveGraphDataService: (meta, graphData) => GraphApi.saveGraphData!(meta, graphData),
              },
            );
          },
        },
      );
    },
  };

  export const VIEW_DIMENSION: IMenuOptions = {
    id: CustomCommands.VIEW_DIMENSION.id,
    label: 'View dimensions',
    isVisible: true,
    iconName: 'EditOutlined',
    onClick: async (args) => {
      const { target, commandService, modelService } = args as any;
      initDimensionGraphCmds({ commandService, target });
    },
  };

  export const SEPARATOR: IMenuOptions = {
    id: 'separator',
    type: MenuItemType.Separator,
  };
}

export const useMenuConfig = createCtxMenuConfig((config) => {
  config.setMenuModelService(async (target, model, modelService, toDispose) => {
    const { type, cell } = target as any;
    switch (type) {
      /** Node menu */
      case 'node':
        model.setValue({
          id: 'root',
          type: MenuItemType.Root,
          submenu: [
            // NsMenuItemConfig.VIEW_DIMENSION,
            // NsMenuItemConfig.SEPARATOR,
            // NsMenuItemConfig.DELETE_NODE,
            NsMenuItemConfig.DELETE_DATASOURCE_NODE,
            // NsMenuItemConfig.RENAME_NODE,
          ],
        });
        break;
      /** Side menu */
      case 'edge':
        model.setValue({
          id: 'root',
          type: MenuItemType.Root,
          submenu: [NsMenuItemConfig.DELETE_EDGE],
        });
        break;
      /** Canvas menu */
      case 'blank':
        model.setValue({
          id: 'root',
          type: MenuItemType.Root,
          submenu: [NsMenuItemConfig.EMPTY_MENU],
        });
        break;
      /** Default menu */
      default:
        model.setValue({
          id: 'root',
          type: MenuItemType.Root,
          submenu: [NsMenuItemConfig.EMPTY_MENU],
        });
        break;
    }
  });
});
