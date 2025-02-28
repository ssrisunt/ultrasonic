import React, { useState, useEffect } from 'react';
/** app Core components */
import { XFlow, XFlowCanvas, XFlowGraphCommands } from '@antv/xflow';
import type { IApplication, IAppLoad, NsGraph, NsGraphCmd } from '@antv/xflow';
/** Interactions */
import {
  /** 触发Command的交互组件 */
  CanvasScaleToolbar,
  NodeCollapsePanel,
  CanvasContextMenu,
  CanvasToolbar,
  /** Graph的扩展交互组件 */
  CanvasSnapline,
  CanvasNodePortTooltip,
  DagGraphExtension,
} from '@antv/xflow';
/** app Component configuration  */
/** Placement Cloth */
import { useGraphHookConfig } from './ConfigGraph';
/** Configure Command */
import { useCmdConfig, initGraphCmds } from './ConfigCmd';
/** Configure Model */
import { useModelServiceConfig } from './ConfigModelService';
/** Configure the Menu */
import { useMenuConfig } from './ConfigMenu';
/** Configure Toolbar */
import { useToolbarConfig } from './ConfigToolbar';
/** Configure the Dnd Palette*/
import * as dndPanelConfig from './ConfigDndPanel';
import { connect } from 'umi';
import type { StateType } from '../model';
import './index.less';
import XflowJsonSchemaFormDrawer from './components/XflowJsonSchemaFormDrawer';
import { getViewInfoList } from '../service';
import { getGraphConfigFromList } from './utils';
import type { GraphConfig } from './data';
import '@antv/xflow/dist/index.css';

import './ReactNodes/ToolTipsNode';

export interface IProps {
  domainManger: StateType;
}

export const SemanticFlow: React.FC<IProps> = (props) => {
  const { domainManger } = props;

  const graphHooksConfig = useGraphHookConfig(props);
  const toolbarConfig = useToolbarConfig();
  const menuConfig = useMenuConfig();
  const cmdConfig = useCmdConfig();
  const modelServiceConfig = useModelServiceConfig();
  const [graphConfig, setGraphConfig] = useState<GraphConfig>();

  const [meta, setMeta] = useState<NsGraph.IGraphMeta>({
    flowId: 'semanticFlow',
    domainManger,
  });

  const cache =
    React.useMemo<{ app: IApplication } | null>(
      () => ({
        app: null as any,
      }),
      [],
    ) || ({} as any);

  const queryGraphConfig = async () => {
    const { code, data } = await getViewInfoList(domainManger.selectDomainId);
    if (code === 200) {
      const config = getGraphConfigFromList(data);
      setGraphConfig(config || ({} as GraphConfig));
    }
  };
  useEffect(() => {
    queryGraphConfig();
  }, [domainManger.selectDomainId]);

  useEffect(() => {
    setMeta({
      ...meta,
      domainManger,
      graphConfig,
    });
  }, [graphConfig]);

  /**
   * @param app 当前XFlow工作空间
   */
  const onLoad: IAppLoad = async (app) => {
    cache.app = app;
    initGraphCmds(cache.app);
  };

  const updateGraph = async (app: IApplication) => {
    await app.executeCommand(XFlowGraphCommands.LOAD_META.id, {
      meta,
    } as NsGraphCmd.GraphMeta.IArgs);
    initGraphCmds(app);
  };

  /** 父组件meta属性更新时,执行initGraphCmds */
  React.useEffect(() => {
    if (cache.app) {
      updateGraph(cache.app);
    }
  }, [cache.app, meta]);
  return (
    <div id="semanticFlowContainer" style={{ height: '100%' }}>
      {meta.graphConfig && (
        <XFlow
          className="dag-user-custom-clz dag-solution-layout"
          hookConfig={graphHooksConfig}
          modelServiceConfig={modelServiceConfig}
          commandConfig={cmdConfig}
          onLoad={onLoad}
          meta={meta}
        >
          <DagGraphExtension layout="LR" />
          <NodeCollapsePanel
            className="xflow-node-panel"
            searchService={dndPanelConfig.searchService}
            nodeDataService={dndPanelConfig.nodeDataService}
            onNodeDrop={dndPanelConfig.onNodeDrop}
            position={{ width: 230, top: 0, bottom: 0, left: 0 }}
            footerPosition={{ height: 0 }}
            bodyPosition={{ top: 40, bottom: 0, left: 0 }}
          />
          <CanvasToolbar
            className="xflow-workspace-toolbar-top"
            layout="horizontal"
            config={toolbarConfig}
            position={{ top: 0, left: 230, right: 0, bottom: 0 }}
          />
          <XFlowCanvas position={{ top: 40, left: 230, right: 0, bottom: 0 }}>
            <CanvasScaleToolbar position={{ top: 60, left: 20 }} />
            <CanvasContextMenu config={menuConfig} />
            <CanvasSnapline color="#faad14" />
            <CanvasNodePortTooltip />
          </XFlowCanvas>

          <XflowJsonSchemaFormDrawer />
        </XFlow>
      )}
    </div>
  );
};

export default connect(({ domainManger }: { domainManger: StateType }) => ({
  domainManger,
}))(SemanticFlow);
