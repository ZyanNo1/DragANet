class DimensionCalculator:
    def __init__(self):
        self.current_dim = (3, 224, 224)  # 默认输入尺寸
        self.flattened = False
        
    def analyze(self, layers):
        for layer in layers:
            layer_type = layer['type']
            params = layer.get('params', {})
            
            if self.flattened and layer_type not in ['Linear', 'Dropout']:
                raise ValueError(f"Cannot add {layer_type} layer after Flatten operation")
            
            if layer_type == 'Conv2d':
                self._handle_conv(params)
            elif layer_type == 'MaxPool2d':
                self._handle_pool(params)
            elif layer_type == 'Linear':
                self._handle_linear(params)
            elif layer_type == 'LSTM':
                self._handle_lstm(params)
            elif layer_type == 'Transformer':
                self._handle_transformer(params)   

    def _handle_conv(self, params):
        # 原始维度计算逻辑
        out_channels = params['out_channels']
        k = params['kernel_size']
        s = params.get('stride', 1)
        p = params.get('padding', 0)

        new_h = (self.current_dim[1] - k + 2*p) // s + 1
        new_w = (self.current_dim[2] - k + 2*p) // s + 1
        self.current_dim = (out_channels, new_h, new_w)
    
    def _handle_pool(self, params):
        k = params['kernel_size']
        s = params.get('stride', k)
        p = params.get('padding', 0)
        
        new_h = (self.current_dim[1] - k + 2*p) // s + 1
        new_w = (self.current_dim[2] - k + 2*p) // s + 1
        self.current_dim = (self.current_dim[0], new_h, new_w)

    def _handle_linear(self, params):
        if not self.flattened:
            self.flattened = True
            self.current_dim = (params['out_features'],)

    def _handle_lstm(self, params):
        self.current_dim = (params['hidden_size'],)
    
    def _handle_transformer(self, params):
        self.current_dim = (params['d_model'],)