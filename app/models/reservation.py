from datetime import date

class Reservation:
    def __init__(self, reservation_id: int, student_id: int, book_id: int, reservation_date: date):
        self.reservation_id = reservation_id
        self.student_id = student_id
        self.book_id = book_id
        self.reservation_date = reservation_date
        self.is_approved = False

    def added_amount(self, amount: float):
        print(f"Added amount {amount} to reservation ID {self.reservation_id}")
        # Logic to handle adding reservation fees or similar

    def check_availability(self):
        print(f"Checking availability for reservation ID {self.reservation_id}")
        # Logic to check book availability for reservation
