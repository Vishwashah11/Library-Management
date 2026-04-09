#include <iostream>
#include <string>
#include <vector>
using namespace std;

// ─────────────────────────────────────────────
//  BOOK
// ─────────────────────────────────────────────
class Book {
public:
    int    book_id;
    string title;
    string author;
    int    copies;
    int    available_copies;
    string category;

    Book(int id, string t, string a, int c, string cat)
        : book_id(id), title(t), author(a), copies(c), available_copies(c), category(cat) {}

    void set_availability(bool status) {
        available_copies = status ? copies : 0;
        cout << "[Book] '" << title << "' availability set to "
             << (status ? "Available" : "Unavailable") << "\n";
    }
};

// ─────────────────────────────────────────────
//  RESERVATION
// ─────────────────────────────────────────────
class Reservation {
public:
    int    reservation_id;
    int    student_id;
    int    book_id;
    string reservation_date;
    string status;
    float  amount;

    Reservation(int id, int sid, int bid, string date)
        : reservation_id(id), student_id(sid), book_id(bid),
          reservation_date(date), status("pending"), amount(0.0) {}

    void added_amount(float a) {
        amount = a;
        cout << "[Reservation] Fine/Amount set to: " << amount << "\n";
    }
    bool check_availability() {
        return true;
    }
};

// ─────────────────────────────────────────────
//  ISSUE TRANSACTION
// ─────────────────────────────────────────────
class IssueTransaction {
public:
    int    issue_id;
    int    student_id;
    int    book_id;
    string issue_date;
    string due_date;
    string return_date;
    float  fine_amount;

    IssueTransaction(int id, int sid, int bid, string idate, string ddate)
        : issue_id(id), student_id(sid), book_id(bid),
          issue_date(idate), due_date(ddate), return_date(""), fine_amount(0.0) {}

    float calculate_fine() {
        cout << "[IssueTransaction] Fine calculated: " << fine_amount << "\n";
        return fine_amount;
    }
    void make_transaction() {
        cout << "[IssueTransaction] Transaction recorded (Issue ID: " << issue_id << ")\n";
    }
};

// ─────────────────────────────────────────────
//  EXTENSION REQUEST
// ─────────────────────────────────────────────
class ExtensionRequest {
public:
    int    extension_id;
    int    issue_id;
    string return_date;
    int    moew_days;
    string status;

    ExtensionRequest(int id, int iid, string rdate, int days)
        : extension_id(id), issue_id(iid), return_date(rdate),
          moew_days(days), status("pending") {}

    bool check_availability() { return true; }

    void approve() {
        status = "approved";
        cout << "[ExtensionRequest] Extension ID " << extension_id << " APPROVED for " << moew_days << " extra days.\n";
    }
    void reject() {
        status = "rejected";
        cout << "[ExtensionRequest] Extension ID " << extension_id << " REJECTED.\n";
    }
};

// ─────────────────────────────────────────────
//  BASE USER
// ─────────────────────────────────────────────
class User {
protected:
    int    user_id;
    string email;
    string password;

public:
    User(int id, string e, string p) : user_id(id), email(e), password(p) {}
    virtual ~User() {}

    bool login() {
        cout << "[User] Logged in as: " << email << "\n";
        return true;
    }
    bool signup() {
        cout << "[User] Signed up: " << email << "\n";
        return true;
    }
    void forget_password() {
        cout << "[User] Password reset email sent to: " << email << "\n";
    }

    int get_id() { return user_id; }
};

// ─────────────────────────────────────────────
//  GLOBAL IN-MEMORY DATABASE
// ─────────────────────────────────────────────
vector<Book>             db_books;
vector<Reservation>      db_reservations;
vector<IssueTransaction> db_issues;
vector<ExtensionRequest> db_extensions;

// ─────────────────────────────────────────────
//  STUDENT
// ─────────────────────────────────────────────
class Student : public User {
public:
    int    roll_no;
    string department;
    string name;

    Student(int id, string e, string p, int r, string dept, string n)
        : User(id, e, p), roll_no(r), department(dept), name(n) {}

    void search_book(string title) {
        cout << "[Student] Searching for: \"" << title << "\"\n";
        for (auto& b : db_books)
            if (b.title.find(title) != string::npos)
                cout << "  -> Found: " << b.title << " | Available: " << b.available_copies << "/" << b.copies << "\n";
    }

    bool check_availability(int book_id) {
        for (auto& b : db_books)
            if (b.book_id == book_id) return b.available_copies > 0;
        return false;
    }

    Book* get_details(int book_id) {
        for (auto& b : db_books)
            if (b.book_id == book_id) return &b;
        return nullptr;
    }

    void issue_book(int book_id) {
        cout << "[Student] Book issue request sent (Book ID: " << book_id << ")\n";
    }

    void return_book(int issue_id) {
        cout << "[Student] Book return request submitted (Issue ID: " << issue_id << ")\n";
    }

    void reserve_book(int book_id) {
        if (check_availability(book_id)) {
            for (auto& b : db_books) {
                if (b.book_id == book_id) { b.available_copies--; break; }
            }
            int id = db_reservations.size() + 1;
            db_reservations.push_back(Reservation(id, user_id, book_id, "2026-04-09"));
            cout << "[Student] Reservation submitted for Book ID " << book_id
                 << " | Reservation ID: " << id << " | Status: pending\n";
        } else {
            cout << "[Student] Book ID " << book_id << " is not available.\n";
        }
    }

    void extension_for_return(int issue_id, int days) {
        int id = db_extensions.size() + 1;
        db_extensions.push_back(ExtensionRequest(id, issue_id, "Extended", days));
        cout << "[Student] Extension requested for " << days << " days (Issue ID: " << issue_id
             << " | Extension ID: " << id << ")\n";
    }
};

// ─────────────────────────────────────────────
//  LIBRARIAN
// ─────────────────────────────────────────────
class Librarian : public User {
public:
    int librarian_id;

    Librarian(int id, string e, string p, int lid) : User(id, e, p), librarian_id(lid) {}

    void update_details(string field, string value) {
        cout << "[Librarian] Updated '" << field << "' to '" << value << "'\n";
    }

    void approve_reserve(int reservation_id) {
        for (auto& r : db_reservations) {
            if (r.reservation_id == reservation_id) {
                r.status = "approved";
                cout << "[Librarian] Reservation ID " << reservation_id << " APPROVED.\n";
                return;
            }
        }
        cout << "[Librarian] Reservation ID " << reservation_id << " not found.\n";
    }

    void approve_extension(int extension_id) {
        for (auto& e : db_extensions) {
            if (e.extension_id == extension_id) { e.approve(); return; }
        }
        cout << "[Librarian] Extension ID " << extension_id << " not found.\n";
    }

    void update_book_availability(int book_id, bool status) {
        for (auto& b : db_books) {
            if (b.book_id == book_id) { b.set_availability(status); return; }
        }
    }

    void process_issue(int student_id, int book_id) {
        for (auto& b : db_books) {
            if (b.book_id == book_id && b.available_copies > 0) {
                b.available_copies--;
                int id = db_issues.size() + 1;
                db_issues.push_back(IssueTransaction(id, student_id, book_id, "2026-04-09", "2026-04-23"));
                cout << "[Librarian] Book '" << b.title << "' issued to Student ID " << student_id
                     << " | Issue ID: " << id << " | Due: 2026-04-23\n";
                return;
            }
        }
        cout << "[Librarian] Book ID " << book_id << " unavailable for issuing.\n";
    }

    void process_return(int issue_id) {
        for (auto it = db_issues.begin(); it != db_issues.end(); ++it) {
            if (it->issue_id == issue_id) {
                for (auto& b : db_books)
                    if (b.book_id == it->book_id) { b.available_copies++; break; }
                cout << "[Librarian] Return processed for Issue ID " << issue_id << ". Stock updated.\n";
                db_issues.erase(it);
                return;
            }
        }
        cout << "[Librarian] Issue ID " << issue_id << " not found.\n";
    }
};

// ─────────────────────────────────────────────
//  ADMINISTRATOR
// ─────────────────────────────────────────────
class Administrator : public User {
public:
    int admin_id;

    Administrator(int id, string e, string p, int aid) : User(id, e, p), admin_id(aid) {}

    void update_user(int uid, string detail) {
        cout << "[Admin] User ID " << uid << " updated: " << detail << "\n";
    }

    void manage_books(string action, Book b) {
        if (action == "add") {
            db_books.push_back(b);
            cout << "[Admin] Book added: '" << b.title << "' (" << b.copies << " copies)\n";
        }
    }

    void give_permission(int uid, string permission) {
        cout << "[Admin] Permission '" << permission << "' granted to User ID " << uid << "\n";
    }

    void reports() {
        cout << "\n========== SYSTEM REPORT ==========\n";
        cout << "  Total Books in Catalog : " << db_books.size() << "\n";
        cout << "  Active Issues          : " << db_issues.size() << "\n";
        cout << "  Active Reservations    : " << db_reservations.size() << "\n";
        cout << "  Pending Extensions     : " << db_extensions.size() << "\n";
        cout << "====================================\n";
    }

    void check_transaction(int issue_id) {
        for (auto& t : db_issues)
            if (t.issue_id == issue_id) {
                cout << "[Admin] Transaction found — Issue ID: " << t.issue_id
                     << " | Book ID: " << t.book_id
                     << " | Student ID: " << t.student_id
                     << " | Due: " << t.due_date << "\n";
                return;
            }
        cout << "[Admin] No active transaction found for Issue ID " << issue_id << "\n";
    }
};

// ─────────────────────────────────────────────
//  MAIN — DEMO WORKFLOW
// ─────────────────────────────────────────────
int main() {
    cout << "============================================\n";
    cout << "  Library Management System — C++ Demo\n";
    cout << "============================================\n\n";

    // --- Setup: Admin adds books ---
    Administrator admin(3, "admin@library.com", "pass", 1);
    admin.manage_books("add", Book(1, "Python Programming",     "Guido Van Rossum", 5, "Programming"));
    admin.manage_books("add", Book(2, "Discrete Mathematics",   "Kenneth Rosen",    3, "Math"));
    admin.manage_books("add", Book(3, "Design Patterns",        "Gang of Four",     2, "SE"));
    admin.give_permission(2, "issue_books");

    // --- Users login ---
    cout << "\n";
    Student   student  (1, "student@uni.edu",    "pass", 101, "CS", "Alice");
    Librarian librarian(2, "librarian@uni.edu",  "pass", 501);
    student.login();
    librarian.login();

    // --- Student: search & reserve ---
    cout << "\n--- Student Workflow ---\n";
    student.search_book("Python");
    student.reserve_book(1);   // Reserve Book ID 1

    // --- Librarian: approve reservation & process issue ---
    cout << "\n--- Librarian Workflow ---\n";
    librarian.approve_reserve(1);            // Approve Reservation ID 1
    librarian.process_issue(student.get_id(), 2);  // Directly issue Book ID 2

    // --- Check active transaction ---
    cout << "\n--- Admin Checks ---\n";
    admin.check_transaction(1);

    // --- Student: request extension ---
    cout << "\n--- Student Extension Request ---\n";
    student.extension_for_return(1, 7);     // 7-day extension on Issue ID 1

    // --- Librarian: approve extension & process return ---
    cout << "\n--- Librarian: Approve & Return ---\n";
    librarian.approve_extension(1);
    librarian.process_return(1);

    // --- Final Admin Report ---
    cout << "\n--- Final Admin Report ---\n";
    admin.reports();

    return 0;
}
