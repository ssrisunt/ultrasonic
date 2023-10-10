import type { IProps } from './index';
import { NsGraph } from '@antv/xflow';
import type { Graph } from '@antv/x6';
import { createHookConfig, DisposableCollection } from '@antv/xflow';
import { DATASOURCE_NODE_RENDER_ID, GROUP_NODE_RENDER_ID } from './constant';
import { AlgoNode } from './ReactNodes/algoNode';
import { GroupNode } from './ReactNodes/group';

export const useGraphHookConfig = createHookConfig<IProps>((config) => {
  // 获取 Props
  // const props = proxy.getValue();
  config.setRegisterHook((hooks) => {
    const disposableList = [
      // Increased registrations react Node Render
      hooks.reactNodeRender.registerHook({
        name: 'add react node',
        handler: async (renderMap) => {
          renderMap.set(DATASOURCE_NODE_RENDER_ID, AlgoNode);
          renderMap.set(GROUP_NODE_RENDER_ID, GroupNode);
        },
      }),
      // Register hooks that modify the graph options configuration
      hooks.graphOptions.registerHook({
        name: 'custom-x6-options',
        after: 'dag-extension-x6-options',
        handler: async (options) => {
          const graphOptions: Graph.Options = {
            connecting: {
              allowLoop: false,
              // Whether the interaction event is triggered
              validateMagnet() {
                // return magnet.getAttribute('port-group') !== NsGraph.AnchorGroup.TOP
                return true;
              },
              // Displays the available link stakes
              validateConnection(args: any) {
                const { sourceView, targetView, sourceMagnet, targetMagnet } = args;

                // Connecting to yourself is not allowed
                if (sourceView === targetView) {
                  return false;
                }
                // Return false without starting point
                if (!sourceMagnet) {
                  return false;
                }
                if (!targetMagnet) {
                  return false;
                }
                // Connections can only be created from the output link pile of the upstream node
                if (sourceMagnet?.getAttribute('port-group') === NsGraph.AnchorGroup.LEFT) {
                  return false;
                }
                // You can only connect to input stubs of downstream nodes
                if (targetMagnet?.getAttribute('port-group') === NsGraph.AnchorGroup.RIGHT) {
                  return false;
                }
                const node = targetView!.cell as any;

                // Determine whether the target link pile can be connected
                const portId = targetMagnet.getAttribute('port')!;
                const port = node.getPort(portId);
                return !!port;
              },
            },
          };
          options.connecting = { ...options.connecting, ...graphOptions.connecting };
        },
      }),
      // hooks.afterGraphInit.registerHook({
      //   name: 'Sign up for tool tips tool',
      //   handler: async (args) => {},
      // }),
    ];
    const toDispose = new DisposableCollection();
    toDispose.pushAll(disposableList);
    return toDispose;
  });
});
