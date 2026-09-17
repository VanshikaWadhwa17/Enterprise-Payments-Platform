export type TableCellType = 'text' | 'money' | 'badge';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  cellType?: TableCellType;
  format?: (value: T[keyof T], row: T) => string;
}
