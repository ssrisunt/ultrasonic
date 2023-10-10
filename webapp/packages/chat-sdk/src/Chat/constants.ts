export const THEME_COLOR_LIST = [
  '#3369FF',
  '#36D2B8',
  '#DB8D76',
  '#47B359',
  '#8545E6',
  '#E0B18B',
  '#7258F3',
  '#0095FF',
  '#52CC8F',
  '#6675FF',
  '#CC516E',
  '#5CA9E6',
];

export enum SemanticTypeEnum {
  MODEL = 'MODEL',
  DIMENSION = 'DIMENSION',
  METRIC = 'METRIC',
  VALUE = 'VALUE',
}

export const SEMANTIC_TYPE_MAP = {
  [SemanticTypeEnum.MODEL]: 'Source of data',
  [SemanticTypeEnum.DIMENSION]: 'Dimension',
  [SemanticTypeEnum.METRIC]: 'Limited Terms',
  [SemanticTypeEnum.VALUE]: 'Dimension Value',
};

export const AGENT_ICONS = [
  'icon-fukuanbaobiaochaxun',
  'icon-hangweifenxi1',
  'icon-xiaofeifenxi',
  'icon-renwuchaxun',
  'icon-baobiao',
  'icon-liushuichaxun',
  'icon-cangkuchaxun',
  'icon-xiaoshoushuju',
  'icon-tongji',
  'icon-shujutongji',
  'icon-mendiankanban',
];

export const HOLDER_TAG = '@_supersonic_@';

export const CHAT_TITLE = '';

export const DEFAULT_CONVERSATION_NAME = 'New Q&A';

export const PAGE_TITLE = 'Q&A Dialogue';

export const WEB_TITLE = 'Q&A Dialogue';

export const MOBILE_TITLE = 'Q&A Dialogue';

export const PLACE_HOLDER = 'Please enter your question, or enter\'/\'Switch Assistant';

export const SIMPLE_PLACE_HOLDER = 'Please enter your question';
