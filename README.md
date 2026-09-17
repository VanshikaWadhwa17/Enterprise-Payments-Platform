# Enterprise-Payments-Platform

A full-stack enterprise payments platform inspired by modern corporate banking systems, built to demonstrate scalable **microfrontend, GraphQL, microservices, event-driven, and cloud-native architecture**.

The platform allows users and banking operations teams to create, approve, monitor, investigate, and reconcile payments while providing fraud monitoring, role-based access control, real-time payment status, and operational dashboards.

---

##  Architecture


                         ┌───────────────────────────┐
                         │       Angular 18          │
                         │       Shell / Host        │
                         │           NX              │
                         └─────────────┬─────────────┘
                                       │
                         Module Federation
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
 ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
 │ Payments MFE    │         │ Fraud MFE       │         │ Reports MFE     │
 │                 │         │                 │         │                 │
 │ Create Payment  │         │ Risk Monitoring │         │ Analytics       │
 │ Payment History │         │ Risk Scores     │         │ Reports         │
 │ Beneficiaries   │         │ Investigations  │         │ Dashboards      │
 └────────┬────────┘         └────────┬────────┘         └────────┬────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      │
                               Apollo Client
                                      │
                                      ▼
                              GraphQL Gateway
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
      Payment Service          Account Service           Fraud Service
        Spring Boot              Spring Boot              Spring Boot
             │                        │                        │
             ▼                        ▼                        ▼
        PostgreSQL               PostgreSQL               PostgreSQL
             │
             └──────────────────────┐
                                    ▼
                                  Kafka
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
                Audit Service  Notification   Analytics
                                  Service       Service

                              Redis
                         ┌────────┴────────┐
                         │                 │
                      Caching         Idempotency
                                    Rate Limiting

---

#  Key Features

## Payment Management

* Create and submit payments
* Payment validation
* Payment history
* Payment details
* Payment status tracking
* Payment cancellation
* Beneficiary management
* Payment search and filtering
* Payment approval workflow

Payment lifecycle:


Created
   ↓
Validated
   ↓
Pending Approval
   ↓
Approved
   ↓
Processing
   ↓
Completed


Failure path:


Processing
    ↓
   Failed
    ↓
Investigation / Retry


---

##  Role-Based Access Control

The application supports different banking roles.


Admin
 ├── Users
 ├── Payments
 ├── Reports
 └── Configuration

Maker
 ├── Create Payment
 └── View Payments

Checker
 ├── View Payments
 ├── Approve Payment
 └── Reject Payment

Operations
 ├── Investigate Payments
 ├── Reconciliation
 └── Audit Logs


Frontend route guards provide the user experience layer while backend authorization independently enforces permissions.

---

#  Microfrontend Architecture

The frontend is implemented as an NX monorepo using **Angular 18 and Module Federation**.


apps/
│
├── shell/
│   └── Main host application
│
├── payments/
│   └── Payment microfrontend
│
├── fraud/
│   └── Fraud monitoring microfrontend
│
├── reconciliation/
│   └── Reconciliation microfrontend
│
├── reports/
│   └── Reporting microfrontend
│
└── admin/
    └── Administration microfrontend


Each microfrontend owns a specific business domain and can be developed and deployed independently.

---

#  Shared NX Libraries


libs/
│
├── ui/
│   ├── buttons/
│   ├── tables/
│   ├── modals/
│   ├── forms/
│   ├── cards/
│   └── charts/
│
├── auth/
│   ├── authentication/
│   ├── route-guards/
│   └── permissions/
│
├── graphql/
│   ├── queries/
│   ├── mutations/
│   ├── fragments/
│   └── generated/
│
├── state/
│   ├── auth/
│   ├── user/
│   └── application/
│
├── types/
│   ├── payment.types.ts
│   ├── account.types.ts
│   ├── fraud.types.ts
│   └── transaction.types.ts
│
└── utils/
    ├── formatting/
    ├── validation/
    └── error-handling/


Shared libraries prevent duplication while keeping business-domain logic within the relevant microfrontend.

---

#  TypeScript Architecture

The frontend is fully TypeScript-based.

The project uses advanced TypeScript features where they provide practical value.

### Strongly typed domain models


type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

interface Payment {
  id: string;
  amount: Money;
  status: PaymentStatus;
  beneficiary: Beneficiary;
}


### Generics


interface ApiResponse<T> {
  data: T;
  success: boolean;
  timestamp: string;
}


### Utility Types


type CreatePayment =
  Omit<Payment, 'id' | 'status'>;

type PaymentSummary =
  Pick<Payment, 'id' | 'amount' | 'status'>;


### Discriminated unions

Payment states are represented using type-safe state models.

---

#  State Management

The application uses different state-management approaches according to the type of state.

### Angular Signals

Used for local component and microfrontend state.


Selected payment
Loading state
Form state
UI state
Filters


### Apollo Client

Used for GraphQL server state and caching.


Payments
Accounts
Fraud information
Transactions
Beneficiaries


### NgRx

Used selectively for genuinely shared application state.

Authentication
Current user
Permissions
Global notifications
Application-level state


The project intentionally avoids putting all server data into a global client-side store.

---

#  GraphQL

GraphQL acts as the primary frontend API layer.

Angular
   ↓
Apollo Client
   ↓
GraphQL Gateway
   ↓
Spring Boot Microservices


Example:


query GetPayment($id: ID!) {
  payment(id: $id) {
    id
    amount
    currency
    status

    beneficiary {
      name
      accountNumber
    }

    fraudScore {
      score
      riskLevel
    }
  }
}


GraphQL code generation provides strongly typed TypeScript operations and responses.

---

#  Spring Boot Microservices

Backend services are independently deployable Spring Boot applications.


backend/
│
├── payment-service/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   └── config/
│
├── account-service/
│
├── fraud-service/
│
├── reconciliation-service/
│
├── notification-service/
│
└── audit-service/


Each service owns its business logic and data.

Example:


PaymentController
       ↓
PaymentService
       ↓
PaymentRepository
       ↓
PostgreSQL


---

# 📨 Event-Driven Architecture

Kafka is used for asynchronous communication between services.

Example:


Payment Service
      │
      │ PaymentCreated
      ▼
    Kafka
      │
      ├──────────────→ Fraud Service
      │
      ├──────────────→ Notification Service
      │
      ├──────────────→ Audit Service
      │
      └──────────────→ Analytics


This reduces synchronous coupling between services.

Example events:


PaymentCreated
PaymentApproved
PaymentRejected
PaymentProcessing
PaymentCompleted
PaymentFailed


---

#  Redis

Redis is used for high-speed, temporary application data rather than as the primary database.

### Caching

Frequently accessed information can be cached.

Application
    ↓
 Redis
    ↓
PostgreSQL


### Idempotency

Payment requests use idempotency keys to prevent accidental duplicate payments.


Request
  ↓
Idempotency Key
  ↓
Redis
  ↓
Already processed?
 ┌───────────┐
 │ Yes       │ → Return existing result
 │ No        │ → Process payment
 └───────────┘


### Rate limiting

Redis counters can be used to limit repeated requests.

---

#  Data Storage

PostgreSQL is used for persistent transactional data.

Example domains:

payments
accounts
beneficiaries
transactions
fraud_cases
audit_records


Each microservice owns its relevant data and business rules.

---

#  Authentication & Security

The platform is designed around:

* OAuth 2.0 / OpenID Connect
* JWT
* Role-Based Access Control
* Angular route guards
* HTTP interceptors
* Backend authorization
* Input validation
* Secure API communication
* Idempotent payment operations

Authentication determines **who the user is**.

Authorization determines **what the user is allowed to do**.

---

#  Reconciliation

The reconciliation module compares payment records across systems.

Example:


Payment ID | Bank | Processor | Settlement | Result
-----------------------------------------------------
P001       | €100 | €100       | €100       | MATCH
P002       | €250 | €250       | €0         | MISSING
P003       | €500 | €450       | €450       | MISMATCH


Operations users can investigate and resolve exceptions.

---

#  Fraud Monitoring

The Fraud MFE provides:

* High-risk transaction monitoring
* Risk scores
* Suspicious payment detection
* Investigation workflow
* Fraud decision history

Example:


Transaction: P82931
Amount: €8,500
Risk Score: 92
Risk Level: HIGH

Factors:
✓ New device
✓ Unusual transaction amount
✓ High transaction velocity


---

#  Real-Time Updates

Payment status can be updated without requiring a manual page refresh.


Payment Service
      ↓
Event / WebSocket / SSE
      ↓
GraphQL / Frontend
      ↓
Angular Signals
      ↓
UI updates


Example:


Processing...
      ↓
Completed ✓


---

#  Testing

Frontend:

* Unit tests
* Component tests
* Service tests
* GraphQL tests
* Microfrontend integration tests
* End-to-end tests

Backend:

* JUnit
* Mockito
* Spring Boot integration tests
* API tests
* Contract testing

---

#  DevOps

The project is designed to be containerized using Docker.


Angular MFE
    ↓
Docker Image
    ↓
Container


Spring Boot services follow the same pattern.

CI/CD pipeline:


Git Commit
    ↓
Pull Request
    ↓
Lint
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Build
    ↓
Docker Image
    ↓
Deploy
    ↓
Monitoring


---

#  Deployment

The platform can be deployed using Kubernetes.


Kubernetes Cluster
│
├── Angular Shell
├── Payments MFE
├── Fraud MFE
├── Reports MFE
│
├── Payment Service
├── Account Service
├── Fraud Service
├── Reconciliation Service
│
├── GraphQL Gateway
├── Kafka
├── Redis
└── PostgreSQL


---

#  Technology Stack

### Frontend

* Angular 18
* TypeScript
* NX
* Module Federation
* GraphQL
* Apollo Client
* RxJS
* Angular Signals
* NgRx
* Angular Material / Tailwind CSS

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* GraphQL
* REST APIs

### Data & Messaging

* PostgreSQL
* Redis
* Apache Kafka

### DevOps

* Git
* Docker
* Kubernetes
* CI/CD
* Automated testing
* Application monitoring

---

#  Project Goals

This project is intended to demonstrate practical experience with:

* Enterprise Angular architecture
* Microfrontends
* NX monorepos
* Module Federation
* Strongly typed TypeScript
* GraphQL
* Java Spring Boot microservices
* Event-driven architecture
* Kafka
* Redis
* PostgreSQL
* Authentication and authorization
* Payment processing workflows
* Distributed-system concepts
* Testing
* Docker and Kubernetes
* CI/CD
* Observability

The focus is on building a realistic enterprise system rather than a simple CRUD banking application.

