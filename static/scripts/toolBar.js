/*******************************
 * 工具栏的按钮的点击操作
 *******************************/
// 工具栏对象
const toolBar = document.getElementById('toolBar');
// 工具栏的所有按钮
const explorerBtn = document.getElementById('explorerBtn');
const connectBtn = document.getElementById('connectBtn');
const compileBtn = document.getElementById('compileBtn');
const propertyBtn = document.getElementById('propertyBtn');
// 点击资源管理器按钮，展开资源管理器
explorerBtn.addEventListener('click', function () {
    console.log('用户点击了资源管理器按钮');
    explorerBtn.classList.toggle('active');
    // 展开资源管理器
    explorer.classList.toggle('active');
    // 调整工作区
    workspace.classList.toggle('withExplorerOpen');
});
// 点击属性列表，展开属性列表
propertyBtn.addEventListener('click', function () {
    console.log('用户点击了属性面板按钮');
    propertyBtn.classList.toggle('active');
    // 展开属性列表
    propertyPanel.classList.toggle('active');
    // 调整工作区
    workspace.classList.toggle('withPropertyOpen');
});
// 点击连接按钮，选择两个模型进行连接
connectBtn.addEventListener('click', function () {
    console.log('用户点击了连接按钮');
    // 计算目前工作区里的层的数量
    const cnt = workspace.getElementsByClassName('DragLinearLayer').length;
    if (cnt < 2) {
        alert('至少需要两个层才能够连接！');
        return;
    }
    connectBtn.classList.add('active');
    connectionMode = 2; // 需要选择两个对象
    // 取消选择所有对象
    undoSelectLayer();
    clearPropertyPanel();
});
// 点击编译按钮，编译成 PyTorch 代码
compileBtn.addEventListener('click', function () {
    let msgs; // 传递给后端的数据
    let startLayer = null; // 开始层
    let endLayer = null;   // 结束层
    console.log('用户点击了编译按钮');
    const cnt = workspace.getElementsByClassName('DragLinearLayer').length;
    if (cnt < 1) {
        alert('你没有添加神经网络层');
        return;
    } else {
        // 首先遍历所有的层，获取最开始的层（没有开始设置的层）
        const linearLayers = workspace.querySelectorAll('.DragLinearLayer');
        const arrows = arrowSvg.querySelectorAll('path');
        linearLayers.forEach(layer => {
            let flag = true;
            // 确定这一层是不是没有作为箭头终点的层
            arrows.forEach(arrow => {
                if (arrow._linkedObject.endLayer.objectRef === layer)
                    flag = false;
            });
            if (flag === true && startLayer) {
                alert('发现多个初始层！');
                return;
            }
            if (flag === true) startLayer = layer._linkedObject;
        });
        if (!startLayer) {
            alert('未发现初始层！');
            return;
        }
        // 将初始层信息存入
        msgs = [{
            type: "Linear",
            name: startLayer.objectRef.id,
            params: {
                in_features: startLayer.inputDim,
                out_features: startLayer.outputDim
            }
        }];
        // 开始循环，每次循环遍历寻找以开始层为起点的连接，并设置结束层为开始层（DFS）
        while (true) {
            let flag = false;
            arrows.forEach(arrow => {
                if (arrow._linkedObject.startLayer === startLayer) {
                    if (flag === true) {
                        alert('发现一层中有多个分支');
                        return;
                    }
                    flag = true;
                    endLayer = arrow._linkedObject.endLayer;
                }
            });
            if (flag === false) break;
            let msg = {
                type: "Linear",
                name: endLayer.objectRef.id,
                params: {
                    in_features: endLayer.inputDim,
                    out_features: endLayer.outputDim
                }
            };
            msgs.push(msg);
            startLayer = endLayer;
        }
    }
    // 将消息传到后端
    console.log('要传递的消息：\n' + JSON.stringify(msgs));
    fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(msgs)
    }).then(async response => {
        const res = await response.json();
        console.log('得到的响应：\n' + res);
        if (response.ok && res.success) {
            // 将生成的代码下载到本地
            const code = res.data;
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'script.py';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('编译错误：\n' + (res.error.message || '未知错误'));
        }
    }).catch(err => {
        alert('与编译服务器通讯异常！请检查连接！');
    });
});