from datetime import date

class ExtensionRequest:
    def __init__(self, extension_id: int, issue_id: int, return_date: date, moew_days: int):
        self.extension_id = extension_id
        self.issue_id = issue_id
        self.return_date = return_date
        self.moew_days = moew_days
        self.status = "pending"

    def check_availability(self):
        print(f"Checking availability for extension ID {self.extension_id}")
        # Logic to check if an extension can be granted

    def approve(self):
        self.status = "approved"
        print(f"Extension request ID {self.extension_id} approved.")
        # Logic to update return_date in the database

    def reject(self):
        self.status = "rejected"
        print(f"Extension request ID {self.extension_id} rejected.")
        # Logic to reject the extension request
