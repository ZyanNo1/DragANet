class DimensionCalculator:
    def __init__(self, input_shape=(3, 224, 224)):
        self.input_shape = input_shape  # 保存初始输入形状
        self.current_dim = input_shape  # 当前张量的维度
        self.flattened = False

    def analyze(self, layers):
        self.current_dim = self.input_shape  # 初始化当前维度
        for layer in layers:
            layer_type = layer['type']
            params = layer.get('params', {})

            if len(self.current_dim) == 1:
                self.flattened = True

            if self.flattened and layer_type not in ['Linear', 'Dropout']:
                raise ValueError(f"Cannot add {layer_type} layer after Flatten operation")

            if layer_type == 'Conv2d':
                self._handle_conv(params)
            elif layer_type == 'MaxPool2d':
                self._handle_pool(params)
            elif layer_type == 'Flatten':
                self._handle_flatten()
            elif layer_type == 'Linear':
                self._handle_linear(params)
            elif layer_type == 'LSTM':
                self._handle_lstm(params)
            elif layer_type == 'Transformer':
                self._handle_transformer(params)
            else:
                raise ValueError(f"Unsupported layer type: {layer_type}")

    def _handle_conv(self, params):
        if 'out_channels' not in params or 'kernel_size' not in params:
            raise ValueError("Conv2d layer requires 'out_channels' and 'kernel_size' parameters")
        out_channels = params['out_channels']
        k = params['kernel_size']
        s = params.get('stride', 1)
        p = params.get('padding', 0)

        h, w = self.current_dim[1], self.current_dim[2]
        new_h = (h - k + 2 * p) // s + 1
        new_w = (w - k + 2 * p) // s + 1
        self.current_dim = (out_channels, new_h, new_w)

    def _handle_pool(self, params):
        if 'kernel_size' not in params:
            raise ValueError("MaxPool2d layer requires 'kernel_size' parameter")
        k = params['kernel_size']
        s = params.get('stride', k)
        p = params.get('padding', 0)

        h, w = self.current_dim[1], self.current_dim[2]
        new_h = (h - k + 2 * p) // s + 1
        new_w = (w - k + 2 * p) // s + 1
        self.current_dim = (self.current_dim[0], new_h, new_w)

    def _handle_flatten(self):
        if len(self.current_dim) != 3:
            raise ValueError("Flatten can only be applied to 3D tensors (channels, height, width)")
        self.current_dim = (self.current_dim[0] * self.current_dim[1] * self.current_dim[2],)
        self.flattened = True

    def _handle_linear(self, params):
        if 'out_features' not in params:
            raise ValueError("Linear layer requires 'out_features' parameter")
        if len(self.current_dim) != 1 and not self.flattened:
            print(f"Before Linear: {self.current_dim}")
            raise ValueError("Linear layer must come after a Flatten layer")
        self.current_dim = (params['out_features'],)

    def _handle_lstm(self, params):
        self.current_dim = (params['hidden_size'],)

    def _handle_transformer(self, params):
        self.current_dim = (params['d_model'],)