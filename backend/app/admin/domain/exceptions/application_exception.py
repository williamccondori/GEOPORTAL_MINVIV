class ApplicationException(Exception):
    def __init__(self, message: str = None):
        self.message = f"app.application_exception:{message}" if message else "app.application_exception"
        super().__init__(self.message)
