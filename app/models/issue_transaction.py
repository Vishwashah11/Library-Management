from datetime import date
from typing import List

class IssueTransaction:
    def __init__(self, issue_id: int, student_id: int, book_id: int, issue_date: date, due_date: date, return_date: date = None, fine_amount: float = 0.0):
        self.issue_id = issue_id
        self.student_id = student_id
        self.book_id = book_id
        self.issue_date = issue_date
        self.due_date = due_date
        self.return_date = return_date
        self.fine_amount = fine_amount

    def calculate_fine(self) -> float:
        print(f"Calculating fine for issue ID {self.issue_id}")
        # Logic to calculate fine if returned late
        return self.fine_amount

    def make_transaction(self):
        print(f"Processing transaction for issue ID {self.issue_id}")
        # Logic to finalize a transaction
