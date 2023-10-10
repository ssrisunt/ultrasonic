/* eslint-disable @typescript-eslint/no-unused-vars */
import { uuidv4 } from '@antv/xflow';
import { XFlowNodeCommands } from '@antv/xflow';
import { DATASOURCE_NODE_RENDER_ID } from './constant';
import type { NsNodeCmd } from '@antv/xflow';
import type { NsNodeCollapsePanel } from '@antv/xflow';
import { Card } from 'antd';

export const onNodeDrop: NsNodeCollapsePanel.IOnNodeDrop = async (node, commands, modelService) => {
  const args: NsNodeCmd.AddNode.IArgs = {
    nodeConfig: { ...node, id: uuidv4() },
  };
  commands.executeCommand(XFlowNodeCommands.ADD_NODE.id, args);
};

const NodeDescription = (props: { name: string }) => {
  return (
    <Card size="small" style={{ width: '200px' }} bordered={false}>
      Drag the Data Source component into the canvas to set up and associate the data source
    </Card>
  );
};

export const nodeDataService: NsNodeCollapsePanel.INodeDataService = async (meta, modelService) => {
  return [
    {
      id: 'Data source',
      header: 'Data source',
      children: [
        {
          id: '2',
          label: 'Add a new data source',
          parentId: '1',
          renderKey: DATASOURCE_NODE_RENDER_ID,
          // renderComponent: (props) => (
          //   <div className="react-dnd-node react-custom-node-1"> {props.data.label} </div>
          // ),
          popoverContent: <NodeDescription name="Data source" />,
        },
      ],
    },
  ];
};

export const searchService: NsNodeCollapsePanel.ISearchService = async (
  nodes: NsNodeCollapsePanel.IPanelNode[] = [],
  keyword: string,
) => {
  const list = nodes.filter((node) => node.label.includes(keyword));
  return list;
};
