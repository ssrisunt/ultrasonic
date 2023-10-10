export enum ChatConfigType {
  DETAIL = 'detail',
  AGG = 'agg',
}

export enum TransType {
  DIMENSION = 'dimension',
  METRIC = 'metric',
}

export enum SemanticNodeType {
  DATASOURCE = 'datasource',
  DIMENSION = 'dimension',
  METRIC = 'metric',
}

export enum MetricTypeWording {
  ATOMIC = 'Atomic indicators',
  DERIVED = 'Derived indicators',
}

export enum DictTaskState {
  ERROR = 'error',
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  UNKNOWN = 'unknown',
}
