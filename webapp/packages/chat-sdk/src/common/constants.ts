import { MsgValidTypeEnum } from './type';

export enum NumericUnit {
  None = 'None',
  TenThousand = '10k',
  EnTenThousand = 'w',
  OneHundredMillion = '100m',
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
  DAY: [{ label: 'last 7 days', value: 7 }, { label: 'Nearly 30 days', value: 30 }, { label: 'Nearly 60 days', value: 60 }, { label: 'Nearly 90 days', value: 90 }],
  WEEK: [{ label: 'Nearly 4 weeks', value: 4 }, { label: 'Nearly 12 weeks', value: 12 }, { label: 'Nearly 24 weeks', value: 24 }, { label: 'Nearly 52 weeks', value: 52 }],
  MONTH: [{ label: 'Nearly 3 months', value: 3 }, { label: 'Nearly 6 months', value: 6 }, { label: 'Almost 12 months', value: 12 }, { label: 'Nearly 24 months', value: 24  }],
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