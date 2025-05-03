class AlreadyExistsException(Exception):
    def __init__(self):
        self.message = "app.already_exists_exception"
        super().__init__(self.message)
