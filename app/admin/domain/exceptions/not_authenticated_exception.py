class NotAuthenticatedException(Exception):
    def __init__(self, is_authenticated: bool = True):
        self.message = "app.not_authenticated_exception"
        if not is_authenticated:
            self.message = "app.not_authenticated_exception:not_authenticated"
        super().__init__(self.message)
