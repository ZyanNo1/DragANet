class ValidationError(Exception):
    def __init__(self, message, layer_type=None):
        super().__init__(message)
        self.layer_type = layer_type

class DimensionMismatchError(Exception):
    def __init__(self, source_layer, target_layer):
        message = f"{source_layer}输出维度与{target_layer}输入不匹配"
        super().__init__(message)

class LayerOrderError(ValidationError):
    def __init__(self, message):
        super().__init__(message, layer_type='Sequence')