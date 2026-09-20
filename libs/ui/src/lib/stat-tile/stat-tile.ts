import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatTileTrend = 'up' | 'down';

@Component({
  selector: 'ui-stat-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.scss',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly sublabel = input<string>();
  readonly trend = input<StatTileTrend>();
}
