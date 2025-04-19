from utils.error_handler import DimensionMismatchError, ValidationError

LAYER_RULES = {
    'Conv2d': {
        'required': ['in_channels', 'out_channels', 'kernel_size'],
        'optional': ['stride', 'padding','activation']
    },
    'BatchNorm2d': {
        'required': ['num_features'],
        'optional': ['eps', 'momentum']
    },
    'Dropout': {
        'required': ['probability'],
        'optional': ['inplace']
    },
    'Transformer': {
        'required': ['d_model', 'nhead'],
        'optional': ['num_encoder_layers', 'num_decoder_layers', 'dim_feedforward']
    },
    'LSTM': {
        'required': ['input_size', 'hidden_size'],
        'optional': ['num_layers', 'batch_first', 'dropout']
    },
    'Linear': {
        'required': ['in_features', 'out_features'],
        'optional': ['bias', 'activation']
    },
    'Flatten': {  
        'required': [],
        'optional': []
    },
    'MaxPool2d': {
        'required': ['kernel_size'],
        'optional': ['stride', 'padding']
    }
}

def validate_layers(layers):
    for idx, layer in enumerate(layers):
        layer_type = layer.get('type')
        if not layer_type:
            raise ValueError(f"Layer {idx} missing 'type' field")
            
        if layer_type not in LAYER_RULES:
            raise ValueError(f"Unsupported layer type: {layer_type} at index {idx}")
            
        params = layer.get('params', {})
        required_params = LAYER_RULES[layer_type]['required']
        optional_params = LAYER_RULES[layer_type]['optional']
        
        # 检查必填参数
        missing = [p for p in required_params if p not in params]
        if missing:
            raise ValueError(f"Layer {idx} ({layer_type}) missing required params: {missing}")
            
        # 检查非法参数
        invalid = [p for p in params if p not in required_params + optional_params]
        if invalid:
            raise ValueError(f"Layer {idx} ({layer_type}) contains invalid params: {invalid}")
        
        # 特殊规则检查
        if layer_type == 'Transformer':
            if params['d_model'] % params['nhead'] != 0:
                raise ValueError(f"Transformer layer {idx}: d_model must be divisible by nhead")
        
        if layer_type == 'LSTM' and 'dropout' in params:
            if params['dropout'] < 0 or params['dropout'] >= 1:
                raise ValueError(f"LSTM layer {idx}: dropout must be in [0, 1)")

def validate_architecture(layers):
    validate_layers(layers)  # 参数检查
    
    has_flatten = False  # 标志是否已经遇到 Flatten 层
    for idx, layer in enumerate(layers):
        layer_type = layer['type']
        
        # 检查 Flatten 层的上下文
        if layer_type == 'Flatten':
            if has_flatten:
                raise ValidationError(
                    f"Layer {idx} ({layer_type}) 不允许多个 Flatten 层",
                    layer_type=layer_type
                )
            if idx == 0 or layers[idx - 1]['type'] not in ['Conv2d', 'MaxPool2d']:
                raise ValidationError(
                    f"Layer {idx} ({layer_type}) 必须在 Conv2d 或 MaxPool2d 层之后",
                    layer_type=layer_type
                )
            has_flatten = True
        
        # 检查 Linear 层的上下文
        if layer_type == 'Linear':
            if not has_flatten:
                raise ValidationError(
                    f"Layer {idx} ({layer_type}) 必须在 Flatten 层之后",
                    layer_type=layer_type
                )
        
        # 检查其他层是否出现在 Flatten 层之后
        if has_flatten and layer_type not in ['Linear', 'Dropout','Flatten']:
            raise ValidationError(
                f"Layer {idx} ({layer_type}) 必须在 Flatten 层之前",
                layer_type=layer_type
            )
    