export interface IdLabel {
  id: number;
  label: string;
}

export type FilterOperator = 'and' | 'or' | 'not' | 'lt' | 'gt' | 'lte' | 'gte' | 'eq' | 'neq' | 'in' | 'nin' | 'like';

export interface FilterIndex<T> {
  prop: keyof T;
  operator: FilterOperator;
  value: string;
}
