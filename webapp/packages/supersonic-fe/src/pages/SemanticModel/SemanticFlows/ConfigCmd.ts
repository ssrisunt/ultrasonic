import type { NsGraphCmd } from '@antv/xflow';
import { createCmdConfig, DisposableCollection, XFlowGraphCommands } from '@antv/xflow';
import type { IApplication } from '@antv/xflow';
import type { IGraphPipelineCommand, IGraphCommandService, NsGraph } from '@antv/xflow';
import { GraphApi } from './service';
import { addDataSourceInfoAsDimensionParents } from './utils';
import { COMMAND_CONTRIBUTIONS } from './CmdExtensions';
import { CustomCommands } from './CmdExtensions/constants';

export const useCmdConfig = createCmdConfig((config) => {
  // 注册全局Command扩展
  config.setCommandContributions(() => COMMAND_CONTRIBUTIONS);
  // 设置hook
  config.setRegisterHookFn((hooks) => {
    const list = [
      hooks.graphMeta.registerHook({
        name: 'get graph meta from backend',
        handler: async (args) => {
          args.graphMetaService = GraphApi.queryGraphMeta;
        },
      }),
      hooks.saveGraphData.registerHook({
        name: 'save graph data',
        handler: async (args) => {
          if (!args.saveGraphDataService) {
            args.saveGraphDataService = GraphApi.saveGraphData;
          }
        },
      }),
      hooks.addNode.registerHook({
        name: 'get node config from backend api',
        handler: async (args) => {
          args.createNodeService = GraphApi.addNode;
        },
      }),
      hooks.delNode.registerHook({
        name: 'get edge config from backend api',
        handler: async (args) => {
          args.deleteNodeService = GraphApi.delNode;
        },
      }),
      hooks.addEdge.registerHook({
        name: 'Gets the business data of the start and end nodes and writes them to the edge',
        handler: async (handlerArgs, handler: any) => {
          const { commandService } = handlerArgs;
          const main = async (args: any) => {
            const res = await handler(args);
            if (res && res.edgeCell) {
              const sourceNode = res.edgeCell.getSourceNode();
              const targetNode = res.edgeCell.getTargetNode();
              const sourceNodeData = sourceNode?.getData() || {};
              const targetNodeData = targetNode?.getData() || {};
              res.edgeCell.setData({
                sourceNodeData,
                targetNodeData,
                source: sourceNodeData.id,
                target: targetNodeData.id,
              });
              // 对边进行tooltips设置
              res.edgeCell.addTools([
                {
                  name: 'tooltip',
                  args: {
                    tooltip: 'Left-click to edit the relationship, right-click to delete',
                  },
                },
              ]);

              if (commandService) {
                const initGraphCmdsState: any = commandService.getGlobal('initGraphCmdsSuccess');
                if (initGraphCmdsState) {
                  // 保存图数据
                  commandService!.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
                    XFlowGraphCommands.SAVE_GRAPH_DATA.id,
                    {
                      saveGraphDataService: (meta, graphData) =>
                        GraphApi.saveGraphData!(meta, graphData),
                    },
                  );
                }
              }
              return res;
            }
          };
          return main;
        },
      }),
      hooks.delEdge.registerHook({
        name: 'edge, and request to the background to delete the association relationship between data sources',
        handler: async (args) => {
          args.deleteEdgeService = GraphApi.delEdge;
        },
      }),
    ];
    const toDispose = new DisposableCollection();
    toDispose.pushAll(list);
    return toDispose;
  });
});

/** Query data for nodes and edges of the graph */
export const initGraphCmds = async (app: IApplication) => {
  const { commandService } = app;
  await app.executeCommandPipeline([
    /** 1. Get data from the server */
    {
      commandId: XFlowGraphCommands.LOAD_DATA.id,
      getCommandOption: async () => {
        commandService.setGlobal('initGraphCmdsSuccess', false);
        return {
          args: {
            loadDataService: GraphApi.loadDataSourceData,
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLoadData.IArgs>,
    /** 2. 执行布局算法 */
    {
      commandId: XFlowGraphCommands.GRAPH_LAYOUT.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult();
        return {
          args: {
            layoutType: 'dagre',
            layoutOptions: {
              type: 'dagre',
              /** Layout orientation */
              rankdir: 'LR',
              /** Node spacing */
              nodesep: 30,
              /** Layer spacing */
              ranksep: 80,
              begin: [0, 0],
            },
            graphData,
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLayout.IArgs>,
    /** 3. Canvas content rendering */
    {
      commandId: XFlowGraphCommands.GRAPH_RENDER.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult();
        const { edges, nodes } = graphData;
        const filterClassNodeEdges = edges.filter((item: NsGraph.IEdgeConfig) => {
          return !item.source.includes('classNodeId-');
        });
        const filterClassNodeNodes = nodes.filter((item: NsGraph.INodeConfig) => {
          return !item.id.includes('classNodeId-');
        });
        return {
          args: {
            graphData: {
              edges: filterClassNodeEdges,
              nodes: filterClassNodeNodes,
            },
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphRender.IArgs>,
    /** 4. 缩放画布 */
    {
      commandId: XFlowGraphCommands.GRAPH_ZOOM.id,
      getCommandOption: async () => {
        commandService.setGlobal('initGraphCmdsSuccess', true);
        return {
          args: { factor: 'fit', zoomOptions: { maxScale: 0.9 } },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphZoom.IArgs>,
    // commandService.executeCommand(CustomCommands.DATASOURCE_RELATION.id, {});
    {
      commandId: CustomCommands.DATASOURCE_RELATION.id,
      getCommandOption: async () => {
        return {
          args: {},
        };
      },
    },
  ]);
  // const nodes = await app.getAllNodes();
  // const classNodes = nodes.filter((item) => {
  //   return item.id.includes('classNodeId');
  // });
  // if (classNodes?.[0]) {
  //   const targetClassId = classNodes[0].id;
  //   await app.commandService.executeCommand<NsNodeCmd.DelNode.IArgs>(
  //     XFlowNodeCommands.DEL_NODE.id,
  //     {
  //       nodeConfig: { id: targetClassId, type: 'class' },
  //     },
  //   );
  // }
};

/** Query the data of dimension nodes and edges under the current data source */
export const initDimensionGraphCmds = async (args: {
  commandService: IGraphCommandService;
  target: NsGraph.INodeConfig;
}) => {
  const { commandService, target } = args;
  await commandService.executeCommandPipeline([
    {
      commandId: XFlowGraphCommands.LOAD_DATA.id,
      getCommandOption: async () => {
        return {
          args: {
            loadDataService: GraphApi.loadDimensionData,
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLoadData.IArgs>,
    /** 2. 执行布局算法 */
    {
      commandId: XFlowGraphCommands.GRAPH_LAYOUT.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult();
        const targetData = {
          ...target.data,
        };
        delete targetData.x;
        delete targetData.y;
        const addGraphData = addDataSourceInfoAsDimensionParents(graphData, targetData);
        ctx.setResult(addGraphData);
        return {
          args: {
            layoutType: 'dagre',
            layoutOptions: {
              type: 'dagre',
              /** 布局方向 */
              rankdir: 'LR',
              /** 节点间距 */
              nodesep: 30,
              /** 层间距 */
              ranksep: 80,
              begin: [0, 0],
            },
            graphData: addGraphData,
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphLayout.IArgs>,
    /** 3. 画布内容渲染 */
    {
      commandId: XFlowGraphCommands.GRAPH_RENDER.id,
      getCommandOption: async (ctx) => {
        const { graphData } = ctx.getResult();
        return {
          args: {
            graphData,
          },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphRender.IArgs>,
    /** 4. 缩放画布 */
    {
      commandId: XFlowGraphCommands.GRAPH_ZOOM.id,
      getCommandOption: async () => {
        return {
          args: { factor: 'fit', zoomOptions: { maxScale: 0.9 } },
        };
      },
    } as IGraphPipelineCommand<NsGraphCmd.GraphZoom.IArgs>,
  ]);
};
