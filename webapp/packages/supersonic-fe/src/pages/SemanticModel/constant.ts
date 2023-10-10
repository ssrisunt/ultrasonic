import { SemanticNodeType } from './enum';

export const SENSITIVE_LEVEL_OPTIONS = [
  {
    label: 'low',
    value: 0,
  },
  {
    label: 'medium',
    value: 1,
  },
  {
    label: 'high',
    value: 2,
  },
];

export const SENSITIVE_LEVEL_ENUM = SENSITIVE_LEVEL_OPTIONS.reduce(
  (sensitiveEnum: any, item: any) => {
    const { label, value } = item;
    sensitiveEnum[value] = label;
    return sensitiveEnum;
  },
  {},
);

export const SEMANTIC_NODE_TYPE_CONFIG = {
  [SemanticNodeType.DATASOURCE]: {
    label: 'Data source',
    value: SemanticNodeType.DATASOURCE,
    color: 'cyan',
  },
  [SemanticNodeType.DIMENSION]: {
    label: 'Dimension',
    value: SemanticNodeType.DIMENSION,
    color: 'blue',
  },
  [SemanticNodeType.METRIC]: {
    label: 'Limited Terms',
    value: SemanticNodeType.METRIC,
    color: 'orange',
  },
};
