from app.models.user import User
from typing import List, Optional

class Student(User):
    def __init__(self, user_id: int, email: str, password: str, roll_no: int, department: str, name: str):
        super().__init__(user_id, email, password)
        self.roll_no = roll_no
        self.department = department
        self.name = name

    def search_book(self, title: str):
        print(f"Student {self.name} searching for book: {title}")
        # Logic to search for a book

    def check_availability(self, book_id: int):
        print(f"Student {self.name} checking availability for book ID: {book_id}")
        # Logic to check book availability

    def get_details(self, book_id: int):
        print(f"Student {self.name} getting details for book ID: {book_id}")
        # Logic to get book details

    def issue_book(self, book_id: int):
        print(f"Student {self.name} issuing book: {book_id}")
        # Logic to issue a book

    def return_book(self, issue_id: int):
        print(f"Student {self.name} returning book for issue: {issue_id}")
        # Logic to return a book

    def reserve_book(self, book_id: int):
        print(f"Student {self.name} reserving book: {book_id}")
        # Logic to reserve a book

    def extension_for_return(self, issue_id: int, days: int):
        print(f"Student {self.name} requesting extension for issue ID: {issue_id} by {days} days")
        # Logic to request return extension
