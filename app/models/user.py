from abc import ABC, abstractmethod

class User(ABC):
    def __init__(self, user_id: int, email: str, password: str):
        self.user_id = user_id
        self.email = email
        self.password = password

    def login(self) -> bool:
        print(f"User {self.email} logged in.")
        return True

    def signup(self) -> bool:
        print(f"User {self.email} signed up.")
        return True

    def forget_password(self):
        print(f"Password reset link sent to {self.email}.")
