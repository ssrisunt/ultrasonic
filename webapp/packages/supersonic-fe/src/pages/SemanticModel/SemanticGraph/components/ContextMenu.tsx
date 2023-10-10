import G6 from '@antv/g6';
import '../style.less';
import { Item } from '@antv/g6-core';
import { presetsTagDomString } from '../../components/AntdComponentDom/Tag';
import { SemanticNodeType } from '../../enum';
import { SEMANTIC_NODE_TYPE_CONFIG } from '../../constant';

type InitContextMenuProps = {
  onMenuClick?: (key: string, item: Item) => void;
};

export const getMenuConfig = (props?: InitContextMenuProps) => {
  const { onMenuClick } = props || {};
  return {
    getContent(evt) {
      const nodeData = evt?.item?._cfg?.model;
      const { name, nodeType } = nodeData as any;
      if (nodeData) {
        const nodeTypeConfig = SEMANTIC_NODE_TYPE_CONFIG[nodeType] || {};
        let ulNode = `
        <li title='Edit' key='edit' >Edit</li>
        <li title='Delete' key='delete' >Delete</li>
     `;
        if (nodeType === SemanticNodeType.DATASOURCE) {
          ulNode = `
              <li title='New dimensions' key='createDimension' >New dimensions</li>
              <li title='New metrics' key='createMetric' >New metrics</li>
              <li title='Edit' key='editDatasource' >Edit</li>
              <li title='Delete' key='deleteDatasource' >Delete</li>
            `;
        }
        const header = `${name}`;
        return `<div class="g6ContextMenuContainer">
          <h3>${presetsTagDomString(nodeTypeConfig.label, nodeTypeConfig.color)}${header}</h3>
          <ul>
        ${ulNode}
        </ul>
        </div>`;
      }
      return `<div>The current node information failed to obtain</div>`;
    },
    handleMenuClick(target, item) {
      const targetKey = target.getAttribute('key') || '';
      onMenuClick?.(targetKey, item);
    },
    // offsetX and offsetY include the padding of the parent container
    // You need to add the parent's padding-left 16 to its own offset of 10
    offsetX: 16 + 10,
    // You need to add the padding-top 24 of the parent container, the height of the canvas brother element, and the offset from itself by 10
    offsetY: 0,
    // the types of items that allow the menu show up
    // On what types of elements to respond to
    itemTypes: ['node'],
  };
};

const initContextMenu = (props?: InitContextMenuProps) => {
  const config = getMenuConfig(props);
  const contextMenu = new G6.Menu(config);

  return contextMenu;
};
export default initContextMenu;
