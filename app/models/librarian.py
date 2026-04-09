from app.models.user import User

class Librarian(User):
    def __init__(self, user_id: int, email: str, password: str, librarian_id: int):
        super().__init__(user_id, email, password)
        self.librarian_id = librarian_id

    def update_details(self, details: dict):
        print(f"Librarian {self.librarian_id} updated details.")
        # Logic to update details

    def approve_reserve(self, reservation_id: int):
        print(f"Librarian {self.librarian_id} approved reservation ID: {reservation_id}")
        # Logic to approve a reservation

    def approve_extension(self, extension_id: int):
        print(f"Librarian {self.librarian_id} approved extension ID: {extension_id}")
        # Logic to approve an extension

    def update_book_availability(self, book_id: int, status: bool):
        print(f"Librarian {self.librarian_id} updated book ID: {book_id} to status: {status}")
        # Logic to update book availability

    def process_issue(self, student_id: int, book_id: int):
        print(f"Librarian {self.librarian_id} processed level for issue of book {book_id} for student {student_id}")
        # Logic to process book issue

    def process_return(self, issue_id: int):
        print(f"Librarian {self.librarian_id} processed return for issue ID: {issue_id}")
        # Logic to process book return
