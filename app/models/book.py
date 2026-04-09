class Book:
    def __init__(self, book_id: int, title: str, author: str, copies: int, category: str):
        self.book_id = book_id
        self.title = title
        self.author = author
        self.copies = copies
        self.category = category

    def set_availability(self, status: bool):
        print(f"Book ID: {self.book_id} availability status set to: {status}")
        # Logic to update availability status in the database
