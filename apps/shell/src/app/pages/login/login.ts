import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import type { Role } from '@epp/types';
import { AuthService } from '@epp/auth';
import { Button, Card } from '@epp/ui';

interface DemoUser {
  username: string;
  role: Role;
  description: string;
}

const DEMO_USERS: DemoUser[] = [
  { username: 'alice', role: 'MAKER', description: 'Creates payments' },
  {
    username: 'bob',
    role: 'CHECKER',
    description: 'Approves or rejects payments',
  },
  { username: 'carol', role: 'ADMIN', description: 'Full access' },
  {
    username: 'dave',
    role: 'OPERATIONS',
    description: 'Investigates and reconciles',
  },
];

@Component({
  selector: 'epp-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly demoUsers = DEMO_USERS;
  readonly selectedUsername = signal(DEMO_USERS[0].username);

  select(username: string): void {
    this.selectedUsername.set(username);
  }

  login(): void {
    const demoUser = this.demoUsers.find(
      (u) => u.username === this.selectedUsername(),
    );
    if (!demoUser) {
      return;
    }
    this.authService.login(demoUser.username, demoUser.role);
    this.router.navigateByUrl('/');
  }
}
