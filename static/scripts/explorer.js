/*******************************
 * 资源管理器的操作
 *******************************/
// 资源管理器对象
const explorer = document.getElementById('explorer');
// 关闭按钮
const explorerHiddenBtn = document.getElementById('explorerHiddenBtn');
// 模型文件夹
const layerFolderHeader = document.getElementById('layerFolderHeader');
// 线性层对象
const linearLayer = document.getElementById('linearLayer');
// 点击按钮，隐藏资源管理器
explorerHiddenBtn.addEventListener('click', function () {
    console.log('用户点击了资源管理器隐藏按钮');
    explorer.classList.remove('active');
    // 将资源管理器按钮设置为不活跃
    explorerBtn.classList.remove('active');
    // 重新调整工作区大小
    workspace.classList.remove('withExplorerOpen');
});
// 点击模型文件夹，显示子项
layerFolderHeader.addEventListener('click', function () {
    // 连接模式下，禁止操作
    if (connectionMode > 0) return;
    console.log('用户点击了模型文件夹');
    const icon = layerFolderHeader.firstElementChild;
    if (icon.className === "fa fa-folder")
        icon.className = "fa fa-folder-open"; // 展开文件夹
    else
        icon.className = "fa fa-folder"; // 合上文件夹
    linearLayer.classList.toggle('active');
});
// 点击线性层模型，在工作区生成可拖拽的线性层实例
linearLayer.addEventListener('click', function () {
    if (connectionMode > 0) return;
    console.log('用户点击了线性层');
    // 创建 dragLinearLayer 对象
    const dragLinearLayer = document.createElement('div');
    // 再创建 LinearLayer 类对象，并与网页对象连接
    let linearLayerInst = new LinearLayer(
        undefined, undefined, undefined, dragLinearLayer
    );
    // 设置可拖拽线性层实例类名
    dragLinearLayer.className = "DragLinearLayer";
    dragLinearLayer.id = "dragLinearLayer" + linearLayerCnt++;
    dragLinearLayer.draggable = true
    // 将网页对象和 JS 对象进行连接
    dragLinearLayer._linkedObject = linearLayerInst;
    // 随机生成实例位置
    const maxX = workspace.clientWidth - dragLinearLayer.style.width;
    const maxY = workspace.clientHeight - dragLinearLayer.style.height;
    // 防止 overflow 溢出
    dragLinearLayer.style.left = `${Math.floor(Math.random() * (maxX - 100))}px`;
    dragLinearLayer.style.top = `${Math.floor(Math.random() * (maxY - 100))}px`;
    // 设置文本
    dragLinearLayer.textContent = "Linear";
    // 添加到容器
    workspace.appendChild(dragLinearLayer);
});