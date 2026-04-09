# Library Management System (C++)

A lightweight, robust C++ simulation for a Library Management System (LMS). This project manages users (Student, Librarian, Administrator), books, live transactions, and inventory requests through a seamless Object-Oriented design.

## Project Structure

```text
library-management/
├── library_management.cpp  # Core application with all class models and logic
├── library_management.exe  # Compiled executable for the demo runtime
└── README.md               # Documentation
```

## Features

- **Inheritance-Based User Roles**: `Student`, `Librarian`, and `Administrator` all inherit from a common `User` base class.
- **In-Memory Global Database**: Uses vectors to cleanly store `Book`, `Reservation`, `IssueTransaction`, and `ExtensionRequest` lists.
- **Role-based Actions**: 
    - **Students** can search books, request extensions, and make reservations.
    - **Librarians** approve reservations/extensions, process issues/returns, and manage availability.
    - **Administrators** can manage users, generate system reports, and monitor transactions.
- **Transaction History**: Tracks issues automatically including due dates.

## How to Compile & Run

You need a C++ compiler (like `g++`) installed on your system. 

1. **Open your terminal or command prompt** inside the project folder.
2. **Compile the program:**
   ```bash
   g++ -o library_management.exe library_management.cpp
   ```
3. **Execute the compiled program:**

   On Windows:
   ```bash
   .\library_management.exe
   ```

   On Linux/macOS:
   ```bash
   ./library_management.exe
   ```

The script will automatically execute a demonstration workflow displaying student queries, reservation approvals, transactions, returns, and inventory stat reporting!
