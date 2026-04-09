# Library Management System

A Python-based framework for a Library Management System (LMS) designed using the class diagram provided. This project includes classes and methods for users (Student, Librarian, Administrator), books, transactions, and requests.

## Project Structure

```text
library-management/
├── app/
│   ├── models/             # Core class models
│   │   ├── __init__.py     # Export models
│   │   ├── user.py         # Base class
│   │   ├── student.py      # Student specifics
│   │   ├── librarian.py    # Librarian specifics
│   │   ├── administrator.py # Admin specifics
│   │   ├── book.py         # Book specifics
│   │   ├── issue_transaction.py # Transactions
│   │   ├── reservation.py  # Reservations
│   │   └── extension_request.py # Extension logic
│   └── __init__.py         # Package mark
├── main.py                 # Demo script
└── README.md               # Documentation
```

## Features

- **Inheritance-based User Management**: `Student`, `Librarian`, and `Administrator` all inherit from a common `User` base class.
- **Transaction History**: Track `IssueTransaction` with fine calculations.
- **Request Workflows**: Manage `Reservation` and `ExtensionRequest` with approvals.
- **Role-based Actions**: 
    - **Students** can search books, request extensions, and make reservations.
    - **Librarians** approve reservations/extensions, process issues/returns, and manage availability.
    - **Administrators** can manage users, generate reports, and monitor transactions.

## How to Run

1. Clone or download the repository.
2. Ensure you have Python 3.7+ installed.
3. Run the demonstration script:
   ```bash
   python main.py
   ```

## Design Correction Applied

The project implements the requested design correction where the relation between **Librarian** and **Reservation** is maintained for approvals, ensuring a smooth workflow between students making reservations and librarians processing them.
