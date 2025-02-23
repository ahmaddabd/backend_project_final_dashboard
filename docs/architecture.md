# Architecture

This project follows **Domain-Driven Design (DDD)** principles, ensuring clear separation of business logic, infrastructure, and application concerns.

## Folder Structure

```
📂 backend-project/
│── 📂 application/      # Application services and business logic
│── 📂 domain/           # Core entities & domain logic
│── 📂 infrastructure/   # Repositories, database access, external APIs
│── 📂 interface/        # Controllers, API endpoints, and middleware
│── 📂 docs/             # Documentation files
```

## Design Principles
- **Domain-Driven Design (DDD)**: The project is divided into `Domain`, `Application`, `Infrastructure`, and `Interface` layers.
- **Repositories Pattern**: All database access is abstracted through repositories.
- **Separation of concerns**: Each layer has a well-defined responsibility.
- **Testability**: Each component is independently testable.
