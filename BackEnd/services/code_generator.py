from jinja2 import Environment, FileSystemLoader
from services.dimension_calculator import DimensionCalculator

class CodeGenerator:
    def __init__(self):
        self.env = Environment(
            loader=FileSystemLoader('app/templates'),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
    def generate_pytorch(self, layers, train_config):
        """包含原始回答中的模板渲染逻辑"""
        template = self.env.get_template('pytorch/model.py.j2')
        # 维度计算
        calculator = DimensionCalculator()
        calculator.analyze(layers)
        return template.render(
            layers=layers,
            input_shape=calculator.input_shape,
            training_config=train_config
        )

def generate_dl_code(framework, layers, train_config):
    generator = CodeGenerator()
    if framework == 'pytorch':
        return generator.generate_pytorch(layers, train_config)
    # 可扩展其他框架...