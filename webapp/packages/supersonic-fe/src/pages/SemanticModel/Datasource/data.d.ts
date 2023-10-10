// Task query result column
export type TaskResultColumn = {
  name: string;
  type: string;
};

// Query the results of the task
export type TaskResultItem = Record<string, string | number>;
