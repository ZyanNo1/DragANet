deep-learning-builder/                     
├── __init__.py                            # Flask app 初始化文件
├── run.py                                 # 启动 Flask 服务器的入口文件
│
├── routes/                                # 路由层：定义所有 API 接口
│   └── api.py                             # /generate 接口，处理前端发来的网络结构并返回生成代码
│
├── services/                           # 核心业务逻辑（生成代码、验证、计算维度）
│   ├── code_generator.py                  # 使用 Jinja2 模板生成完整的深度学习模型代码
│   ├── validation.py                      # 结构和参数合法性校验（必填字段、参数范围、层顺序）
│   └── dimension_calculator.py            # 逐层计算张量形状，检查维度兼容性（如 Conv → Pool → Linear）
│
├── templates/                          # 模板文件目录
│   ├── pytorch/                           # 按深度学习框架分类（目前是 PyTorch）
│   │   └── model.py.j2                    # Jinja2 模板，定义生成的 PyTorch 模型代码格式
│   └── demo.html                          # 前端网页
│
├── utils/                              # 工具模块（响应封装、异常类）
│   ├── response.py                        # format_response()：
│   │                                          统一接口返回格式（success/data/error）
│   └── error_handler.py                   # 自定义异常
│                                            （ValidationError DimensionMismatchError）
├── static/                             # 静态文件（前端页面）
│   ├── css/                               # 样式表
│   │   └── style.css  
│   └── js/                                # 前端交互逻辑
│       └── script.js
