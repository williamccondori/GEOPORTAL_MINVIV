class WmsException(Exception):
    def __init__(self, details: str):
        self.message = "app.wms_exception:%s" % details
        super().__init__(self.message)
