export type MetricOptionType = {
  id: string;
  metricId?: number;
  modelId?: number;
}

export enum AgentToolTypeEnum {
  RULE = 'RULE',
  DSL = 'DSL',
  PLUGIN = 'PLUGIN',
  INTERPRET = 'INTERPRET'
}

export enum QueryModeEnum {
  ENTITY_DETAIL = 'ENTITY_DETAIL',
  ENTITY_LIST_FILTER = 'ENTITY_LIST_FILTER',
  ENTITY_ID = 'ENTITY_ID',
  METRIC_ENTITY = 'METRIC_ENTITY',
  METRIC_FILTER = 'METRIC_FILTER',
  METRIC_GROUPBY = 'METRIC_GROUPBY',
  METRIC_MODEL = 'METRIC_MODEL',
  METRIC_ORDERBY = 'METRIC_ORDERBY'
}

export const AGENT_TOOL_TYPE_LIST = [
  {
    label: 'Agent Tool Rule',
    value: AgentToolTypeEnum.RULE
  },
  {
    label: 'Large model semantic parsing',
    value: AgentToolTypeEnum.DSL
  },
  {
    label: 'Interpretation of large model indicators',
    value: AgentToolTypeEnum.INTERPRET
  },
  {
    label: 'Third-party plugins',
    value: AgentToolTypeEnum.PLUGIN
  },
]

export const QUERY_MODE_LIST = [
  {
    label: 'Entity details (query dimension information)',
    value: QueryModeEnum.ENTITY_DETAIL
  },
  {
    label: 'Entity Circle',
    value: QueryModeEnum.ENTITY_LIST_FILTER
  },
  {
    label: 'Entity queries (query by Entity ID)',
    value: QueryModeEnum.ENTITY_ID
  },
  {
    label: 'Metric query (with entities)',
    value: QueryModeEnum.METRIC_ENTITY
  },
  {
    label: 'Metric query (with conditions)',
    value: QueryModeEnum.METRIC_FILTER
  },
  {
    label: 'Metric queries (grouped by dimension)',
    value: QueryModeEnum.METRIC_GROUPBY
  },
  {
    label: 'Metric query (without conditions)',
    value: QueryModeEnum.METRIC_MODEL
  },
  {
    label: 'Sort by metric',
    value: QueryModeEnum.METRIC_ORDERBY
  }
];

export type AgentToolType = {
  id?: string;
  type: AgentToolTypeEnum;
  name: string;
  queryModes?: QueryModeEnum[];
  plugins?: number[];
  metricOptions?: MetricOptionType[];
  exampleQuestions?: string[];
  modelIds?: number[];
}

export type AgentConfigType = {
  tools: AgentToolType[];
}

export type AgentType = {
  id?: number;
  name?: string;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  examples?: string[];
  status?: 0 | 1;
  enableSearch?: 0 | 1;
  agentConfig?: AgentConfigType;
}

export type ModelType = {
  id: number | string;
  parentId: number;
  name: string;
  bizName: string;
};

export type MetricType = {
  id: number;
  name: string;
  bizName: string;
};
