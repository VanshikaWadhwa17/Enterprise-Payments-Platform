import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { StatusBadge } from '../badge/status-badge';
import type { TableColumn } from './table.types';

@Component({
  selector: 'ui-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadge],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table<T extends object> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<TableColumn<T>[]>();
  readonly trackByKey = input<keyof T>();

  readonly rowClick = output<T>();

  trackRow = (index: number, row: T): unknown => {
    const key = this.trackByKey();
    return key ? row[key] : index;
  };

  cellValue(column: TableColumn<T>, row: T): string {
    const value = row[column.key];
    if (column.format) {
      return column.format(value, row);
    }
    return String(value);
  }

  cellStatus(column: TableColumn<T>, row: T): string {
    return String(row[column.key]);
  }
}
