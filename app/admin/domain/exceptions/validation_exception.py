class ValidationException(Exception):
    def __init__(self, model: str):
        self.message = "app.validation_exception:%s" % model
        super().__init__(self.message)
