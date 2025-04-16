from flask import Blueprint, request
from services.code_generator import generate_dl_code
from utils.response import format_response
from services.validation import validate_architecture
from utils.error_handler import DimensionMismatchError, ValidationError

api_bp = Blueprint('api', __name__)

@api_bp.route('/generate', methods=['POST'])
def generate_code_endpoint():
    try:
        data = request.get_json()
        validate_architecture(data['layers'])
        
        # 添加维度兼容性检查
        code = generate_dl_code('pytorch', data['layers'], {})
        return format_response(data=code)
    
    except ValidationError as e:
        return format_response(
            success=False,
            error=f"Validation Error: {str(e)}",
            layer_type=e.layer_type
        ), 400
    except DimensionMismatchError as e:
        return format_response(
            success=False,
            error=f"Dimension Error: {str(e)}"
        ), 422
    except Exception as e:
        return format_response(
            success=False,
            error=f"Server Error: {str(e)}"
        ), 500