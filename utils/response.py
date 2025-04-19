def format_response(success=True, data=None, error=None, layer_type=None):
    return {
        'success': success,
        'data': data,
        'error': {
            'message': error,
            'type': layer_type
        } if error else None
    }