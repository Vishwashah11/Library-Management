from datetime import date, timedelta
from app.models import Student, Librarian, Administrator, Book, IssueTransaction, Reservation, ExtensionRequest

def run_library_demo():
    print("-" * 50)
    print("Library Management System Demo")
    print("-" * 50)

    # 1. Initialize Users
    student = Student(user_id=1, email="student@uni.edu", password="hashed_password", roll_no=101, department="CS", name="Alice")
    librarian = Librarian(user_id=2, email="librarian@uni.edu", password="hashed_password", librarian_id=501)
    admin = Administrator(user_id=3, email="admin@uni.edu", password="hashed_password", admin_id=1)

    # 2. Add some Books
    book1 = Book(book_id=1, title="Python Programming", author="Guido Van Rossum", copies=5, category="Programming")
    book2 = Book(book_id=2, title="Discrete Mathematics", author="Kenneth Rosen", copies=3, category="Math")

    print(f"Logged in as Student: {student.name}")
    print(f"Logged in as Librarian: {librarian.librarian_id}")
    print(f"Logged in as Administrator: {admin.admin_id}\n")

    # 3. Student Action: Search and Reserve Book
    student.search_book("Python")
    student.reserve_book(book1.book_id)

    # 4. Librarian Action: Approve Reservation (User Correction)
    reservation = Reservation(reservation_id=1001, student_id=student.user_id, book_id=book1.book_id, reservation_date=date.today())
    librarian.approve_reserve(reservation.reservation_id)
    reservation.is_approved = True

    # 5. Librarian Action: Issue Book
    issue_date = date.today()
    due_date = issue_date + timedelta(days=14)
    issue = IssueTransaction(issue_id=2001, student_id=student.user_id, book_id=book1.book_id, issue_date=issue_date, due_date=due_date)
    librarian.process_issue(student.user_id, book1.book_id)

    # 6. Student Action: Request Extension
    student.extension_for_return(issue.issue_id, days=7)
    extension = ExtensionRequest(extension_id=3001, issue_id=issue.issue_id, return_date=due_date + timedelta(days=7), moew_days=7)

    # 7. Librarian Action: Approve Extension
    librarian.approve_extension(extension.extension_id)
    extension.approve()

    # 8. Administrator Action: Generate Reports
    admin.reports()
    admin.check_transaction(issue.issue_id)

    print("\n" + "-" * 50)
    print("Demo completed successfully!")
    print("-" * 50)

if __name__ == "__main__":
    run_library_demo()
