-- Create Database
CREATE DATABASE IF NOT EXISTS library_management;
USE library_management;

-- Users Table (Base)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'librarian', 'admin') NOT NULL,
    otp VARCHAR(6),
    otp_expiry DATETIME
);

-- Students Table
CREATE TABLE IF NOT EXISTS Students (
    id INT PRIMARY KEY,
    roll_no INT UNIQUE NOT NULL,
    department VARCHAR(100),
    name VARCHAR(255),
    FOREIGN KEY (id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Librarians Table
CREATE TABLE IF NOT EXISTS Librarians (
    id INT PRIMARY KEY,
    librarian_id INT UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Administrators Table
CREATE TABLE IF NOT EXISTS Administrators (
    id INT PRIMARY KEY,
    admin_id INT UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Books Table
CREATE TABLE IF NOT EXISTS Books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    copies INT DEFAULT 1,
    category VARCHAR(100),
    available_copies INT DEFAULT 1
);

-- IssueTransactions Table
CREATE TABLE IF NOT EXISTS IssueTransactions (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    book_id INT,
    issue_date DATE,
    due_date DATE,
    return_date DATE,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (student_id) REFERENCES Students(id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS Reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    book_id INT,
    reservation_date DATE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (student_id) REFERENCES Students(id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

-- ExtensionRequests Table
CREATE TABLE IF NOT EXISTS ExtensionRequests (
    extension_id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT,
    return_date DATE,
    more_days INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (issue_id) REFERENCES IssueTransactions(issue_id)
);

-- Seed some initial data
INSERT IGNORE INTO Users (id, email, password, role) VALUES 
(1, 'admin@library.com', 'admin123', 'admin'),
(2, 'librarian@library.com', 'lib123', 'librarian'),
(3, 'student@library.com', 'stud123', 'student');

INSERT IGNORE INTO Administrators (id, admin_id) VALUES (1, 100);
INSERT IGNORE INTO Librarians (id, librarian_id) VALUES (2, 501);
INSERT IGNORE INTO Students (id, roll_no, name, department) VALUES (3, 101, 'John Doe', 'Computer Science');

INSERT IGNORE INTO Books (title, author, copies, available_copies, category) VALUES 
('The Pragmatic Programmer', 'Andrew Hunt', 5, 5, 'Software Engineering'),
('Clean Code', 'Robert C. Martin', 3, 3, 'Programming'),
('Design Patterns', 'Erich Gamma', 2, 2, 'Architecture');
