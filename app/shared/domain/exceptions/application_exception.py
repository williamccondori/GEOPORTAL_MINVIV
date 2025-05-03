class ApplicationException(Exception):
    def __init__(self, details: str):
        self.message = "app.application_exception:%s" % details
        super().__init__(self.message)
