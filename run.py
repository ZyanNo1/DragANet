# run.py
from __init__ import create_app

app = create_app()

if __name__ == '__main__':
    # 开发模式下启动 Flask 内置的服务器
    app.run(debug=True, port=5000)
