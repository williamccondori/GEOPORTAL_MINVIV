class NotFoundException(Exception):
    def __init__(self, model: str):
        self.message = "app.not_found_exception:%s" % model
        super().__init__(self.message)
