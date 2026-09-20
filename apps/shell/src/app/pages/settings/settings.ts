import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@epp/auth';
import { Card } from '@epp/ui';

@Component({
  selector: 'epp-settings',
  imports: [Card],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly authService = inject(AuthService);

  protected readonly currentUser = this.authService.currentUser;
}
