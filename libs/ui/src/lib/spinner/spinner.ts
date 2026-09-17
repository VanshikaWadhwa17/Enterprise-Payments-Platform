import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss',
})
export class Spinner {
  readonly label = input('Loading…');
}
