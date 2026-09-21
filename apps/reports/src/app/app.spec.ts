import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AUTH_API_URL } from '@epp/auth';
import { PaymentGraphQL, FraudGraphQL, ReconciliationGraphQL } from '@epp/graphql';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        { provide: AUTH_API_URL, useValue: 'http://localhost:8086' },
        { provide: PaymentGraphQL.GetPaymentsGQL, useValue: {} },
        { provide: FraudGraphQL.GetFraudCasesGQL, useValue: {} },
        { provide: ReconciliationGraphQL.GetReconciliationRecordsGQL, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create the Reports page', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the Reports heading', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Reports');
  });
});
