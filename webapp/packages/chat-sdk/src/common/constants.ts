import { MsgValidTypeEnum } from './type';

export enum NumericUnit {
  None = '无',
  TenThousand = '万',
  EnTenThousand = 'w',
  OneHundredMillion = '亿',
  Thousand = 'k',
  Million = 'M',
  Giga = 'G',
}

export const PRIMARY_COLOR = '#f87653';
export const CHART_BLUE_COLOR = '#446dff';

export const CHAT_BLUE = '#1b4aef';

export const CHART_SECONDARY_COLOR = 'rgba(153, 153, 153, 0.3)';

export const CLS_PREFIX = 'ss-chat';

export const DATE_TYPES = {
  DAY: [{ label: '近7天', value: 7 }, { label: '近30天', value: 30 }, { label: '近60天', value: 60 }, { label: '近90天', value: 90 }],
  WEEK: [{ label: '近4周', value: 4 }, { label: '近12周', value: 12 }, { label: '近24周', value: 24 }, { label: '近52周', value: 52 }],
  MONTH: [{ label: '近3个月', value: 3 }, { label: '近6个月', value: 6 }, { label: '近12个月', value: 12 }, { label: '近24个月', value: 24  }],
};

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

export const PARSE_ERROR_TIP = 'The intelligent assistant doesn\'t understand what you say, so I must supplement my knowledge when I go back';

export const SEARCH_EXCEPTION_TIP = 'There is an error with the query, the database may be abnormal or the load is heavy, please contact the administrator or try again later';

export const MSG_VALID_TIP = {
  [MsgValidTypeEnum.SEARCH_EXCEPTION]: 'Search exception',
  [MsgValidTypeEnum.INVALID]: 'The intelligent assistant does not understand what you say, so you must supplement your knowledge when you go back',
};

export const PREFIX_CLS = 'ss-chat';

export const AGG_TYPE_MAP = {
  SUM: 'sum',
  AVG: 'average',
  MAX: 'maximum',
  MIN: 'minimum',
}