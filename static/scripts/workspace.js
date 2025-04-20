/*******************************
 * 工作区的操作
 *******************************/
// 统计工作区中线性层实例和连接箭头的个数
let linearLayerCnt = 0;
let connectionCnt = 0;
// 连接模式的设置
let connectionMode = 0;
let startLayer = null;
let endLayer = null;
// 工作区对象
const workspace = document.getElementById('workspace');
// 连接箭头的容器
const arrowSvg = document.getElementById('arrowSvg');
// 设置线性层拖动的状态
workspace.addEventListener('dragstart', function (e) {
    if (connectionMode > 0) return;
    // 拖动的线性层对象
    const dragLinearLayer = e.target.closest('.DragLinearLayer');
    if (dragLinearLayer) {
        console.log(`正在拖拽线性层：${dragLinearLayer.id}`);
        e.dataTransfer.setData('text/plain', dragLinearLayer.id);
        // 设置半透明
        dragLinearLayer.classList.add('dragging');
    }
});
workspace.addEventListener('dragend', function (e) {
    const dragLinearLayer = e.target.closest('.DragLinearLayer');
    dragLinearLayer.classList.remove('dragging');
});
// 工作区需要允许放置
workspace.addEventListener('dragover', function (e) {
    e.preventDefault();
});
// 拖动结束后，计算新位置
workspace.addEventListener('drop', function (e) {
    console.log('拖动完成！')
    e.preventDefault();
    // 获取拖拽对象的 id
    const id = e.dataTransfer.getData('text/plain');
    const dragLinearLayer = document.getElementById(id);
    // 获取工作区和线性层实例的大小
    const workspaceRect = workspace.getBoundingClientRect();
    const linearLayerRect = dragLinearLayer.getBoundingClientRect();
    // 计算新位置
    let x = e.clientX - workspaceRect.left - (dragLinearLayer.offsetWidth / 2);
    let y = e.clientY - workspaceRect.top - (dragLinearLayer.offsetHeight / 2);
    // 检查边界
    if (x < 10) x = 10;
    if (x + linearLayerRect.width > workspaceRect.width - 10)
        x = workspaceRect.width - linearLayerRect.width - 10;
    if (y < 10) y = 10;
    if (y + linearLayerRect.height > workspaceRect.height - 10)
        y = workspaceRect.height - linearLayerRect.height - 10;
    // 移动位置
    dragLinearLayer.style.left = `${x}px`;
    dragLinearLayer.style.top = `${y}px`;
    // 重新设置箭头
    const arrows = arrowSvg.querySelectorAll('path');
    arrows.forEach(arrow => {
        // 获取箭头的连接的两个层对象
        const startLayer = arrow._linkedObject.startLayer;
        const endLayer = arrow._linkedObject.endLayer;
        if (dragLinearLayer === startLayer.objectRef || dragLinearLayer === endLayer.objectRef) {
            // 调整位置
            const x_s = startLayer.objectRef.offsetLeft + startLayer.objectRef.offsetWidth / 2;
            const y_s = startLayer.objectRef.offsetTop + startLayer.objectRef.offsetHeight;
            const x_t = endLayer.objectRef.offsetLeft + endLayer.objectRef.offsetWidth / 2;
            const y_t = endLayer.objectRef.offsetTop - 15;
            arrow.setAttribute('d', `M${x_s}, ${y_s} L${x_t}, ${y_t}`);
        }
    });
});
// 点击工作区
workspace.addEventListener('click', function (e) {
    // 选择的线性层对象
    const dragLinearLayer = e.target.closest('.DragLinearLayer');
    // 取消选择所有对象
    undoSelectLayer();
    // 删除所有属性面板元素
    clearPropertyPanel();
    if (dragLinearLayer) {
        // 选择该对象
        dragLinearLayer.classList.add('active');
        if (connectionMode === 0)
            // 不处于连接模式时，在属性面板显示实例的层结构
            showProperties(dragLinearLayer._linkedObject);
        else if (connectionMode === 2) {
            // 选择开始层
            console.log('用户选择了开始层：' + dragLinearLayer.id);
            connectionMode--;
            startLayer = dragLinearLayer._linkedObject;
        } else {
            // 选择结束层
            console.log('用户选择了结束层：' + dragLinearLayer.id);
            endLayer = dragLinearLayer._linkedObject;
            if (endLayer === startLayer) {
                alert('不能自己与自己连接！');
                return;
            }
            // 创建一个箭头，表示对象的连接
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrow.id = 'layerConnection' + connectionCnt++;
            // 创建连接的对象实例
            const connection = new LayerConnection(
                startLayer, endLayer, arrow
            );
            arrow._linkedObject = connection;
            arrow.setAttribute('stroke-width', '2');
            arrow.setAttribute('stroke', 'black');
            arrow.setAttribute('marker-end', 'url(#arrowhead)');
            // 设置连接的起始和结束位置
            const x_s = startLayer.objectRef.offsetLeft + startLayer.objectRef.offsetWidth / 2;
            const y_s = startLayer.objectRef.offsetTop + startLayer.objectRef.offsetHeight;
            const x_t = endLayer.objectRef.offsetLeft + endLayer.objectRef.offsetWidth / 2;
            const y_t = endLayer.objectRef.offsetTop - 15;
            arrow.setAttribute('d', `M${x_s}, ${y_s} L${x_t}, ${y_t}`);
            arrowSvg.appendChild(arrow);
            // 退出连接模式
            connectionMode--;
            connectBtn.classList.remove('active');
            startLayer = null;
            endLayer = null;
            undoSelectLayer();
        }
    } else if (connectionMode > 0) {
        // 取消连接
        connectionMode = 0;
        connectBtn.classList.remove('active');
    }
});

// 取消选择所有对象
function undoSelectLayer() {
    const dragLinearLayers = workspace.querySelectorAll('.DragLinearLayer');
    dragLinearLayers.forEach(layer => {
        layer.classList.remove('active');
    });
}