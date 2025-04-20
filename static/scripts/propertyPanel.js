/*******************************
 * 属性面板的操作
 *******************************/
// 属性面板对象
const propertyPanel = document.getElementById('propertyPanel');
// 关闭按钮
const propertyPanelHiddenBtn = document.getElementById('propertyPanelHiddenBtn');
// 点击按钮，隐藏属性面板
propertyPanelHiddenBtn.addEventListener('click', function () {
    console.log('用户点击了属性面板隐藏按钮');
    document.getElementById('propertyPanel').classList.remove('active');
    // 将工具栏的属性面板按钮置为不活跃
    document.getElementById('propertyBtn').classList.remove('active');
    // 将工作区设为属性面板隐藏状态
    document.getElementById('workspace').classList.remove('withPropertyOpen');
});
// 点击事件的处理
propertyPanel.addEventListener('click', function(e) {
    const saveBtn = e.target.closest('.SaveBtn');
    // 点击保存按钮，保存选中的层的信息
    if (saveBtn) {
        console.log('用户点击了保存按钮');
        // 寻找选中的层
        const selectedLinearLayer = workspace.querySelector('.DragLinearLayer.active');
        const linearLayerInst = selectedLinearLayer._linkedObject;
        // 调整该层的信息
        linearLayerInst.inputDim = parseInt(document.getElementById('inputDimInput').value);
        linearLayerInst.outputDim = parseInt(document.getElementById('outputDimInput').value);
        linearLayerInst.activationFunc = document.getElementById('activationFuncInput').value;
        linearLayerInst.describe();
        alert('保存成功！');
    }
    const delBtn = e.target.closest('.DelBtn');
    // 点击删除按钮，删除选中的层和其链接的对象
    if (delBtn) {
        console.log('用户点击了删除按钮');
        if (!confirm('确认要删除该层吗？')) return;
        // 寻找选中的层
        const selectedLinearLayer = workspace.querySelector('.DragLinearLayer.active');
        // 删除层
        selectedLinearLayer.remove();
        // 清空显示面板
        clearPropertyPanel();
    }
});

// 清空显示面板
function clearPropertyPanel() {
    const PropertyPanelRows = propertyPanel.querySelectorAll('.PropertyPanelRow');
    PropertyPanelRows.forEach(row => {
        row.remove();
    });
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.remove();
    const delBtn = document.getElementById('delBtn');
    if (delBtn) delBtn.remove();
}
// 显示被选中模型的属性
function showProperties(linearLayer) {
    // 输入输出属性信息
    const dimProperties = [
        { label: '输入维度：', id: 'inputDim', default: String(linearLayer.inputDim) },
        { label: '输出维度：', id: 'outputDim', default: String(linearLayer.outputDim) },
    ];
    // 激活函数信息
    const activationFuncs = [
        { value: 'Sigmoid' },
        { value: 'ReLU' },
        { value: 'LeakyReLU' }
    ];
    // 添加输入输出维度属性
    dimProperties.forEach(prop => {
        // 创建行
        const row = document.createElement('div');
        row.className = 'PropertyPanelRow';
        row.id = prop.id + 'Row';
        // 创建标签
        const label = document.createElement('span');
        label.if = prop.id + 'Label';
        label.textContent = prop.label;
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.id = prop.id + 'Input';
        input.value = prop.default;
        // 添加到行
        row.appendChild(label);
        row.appendChild(input);
        // 添加到属性面板
        propertyPanel.appendChild(row);
    });
    // 添加激活函数属性
    const row = document.createElement('div');
    row.className = 'PropertyPanelRow';
    const label = document.createElement('span');
    label.id = 'activationFuncLabel';
    label.textContent = '激活函数：';
    // 设置 select 对象
    const selectItem = document.createElement('select');
    selectItem.className = 'PropertyPanelSelectItem';
    selectItem.id = 'activationFuncInput';
    // 设置选项
    activationFuncs.forEach(func => {
        const optItem = document.createElement('option');
        optItem.value = func.value;
        optItem.textContent = func.value;
        if (optItem.value === linearLayer.activationFunc)
            optItem.selected = true;
        selectItem.appendChild(optItem);
    });
    row.appendChild(label);
    row.appendChild(selectItem);
    propertyPanel.appendChild(row);
    // 添加保存按钮
    const saveBtn = document.createElement('button');
    saveBtn.className = "SaveBtn";
    saveBtn.id = "saveBtn";
    saveBtn.textContent = "保存";
    propertyPanel.appendChild(saveBtn);
    // 添加删除按钮
    const delBtn = document.createElement('button');
    delBtn.className = "DelBtn";
    delBtn.id = "delBtn";
    delBtn.textContent = "删除";
    propertyPanel.appendChild(delBtn);
}