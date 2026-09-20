import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmptyState } from '@epp/ui';

@Component({
  selector: 'epp-access-denied',
  imports: [RouterModule, EmptyState],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss',
})
export class AccessDenied {}
