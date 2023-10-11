import G6 from '@antv/g6';
import moment from 'moment';

const initTooltips = () => {
  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    fixToNode: [1, 0.5],
    // 允许出现 tooltip 的 item Type
    itemTypes: ['node'],
    // 自定义 tooltip 内容
    getContent: (e) => {
      const outDiv = document.createElement('div');
      outDiv.style.width = 'fit-content';
      outDiv.style.height = 'fit-content';
      const model = e!.item!.getModel();

      const { name, bizName, createdBy, updatedAt, description } = model;
      const list = [
        {
          label: 'Name:',
          value: name,
        },
        {
          label: 'Business Name:',
          value: bizName,
        },
        {
          label: 'Created by:',
          value: createdBy,
        },
        {
          label: 'Update time:',
          value: updatedAt ? moment(updatedAt).format('YYYY-MM-DD HH:mm:ss') : '',
        },
        {
          label: 'Description:',
          value: description,
        },
      ];
      const listHtml = list.reduce((htmlString, item) => {
        const { label, value } = item;
        if (value) {
          htmlString += `<p style="margin-bottom:0">
          <span>${label} </span>
          <span>${value}</span>
        </p>`;
        }
        return htmlString;
      }, '');
      const html = `<div>
      ${listHtml}
    </div>`;
      if (e!.item!.getType() === 'node') {
        outDiv.innerHTML = html;
      }
      return outDiv;
    },
  });

  return tooltip;
};
export default initTooltips;
