document.addEventListener('DOMContentLoaded', function () {

    // ****** 侧边栏按钮操作 ******
    const menuBtn = document.getElementById('menuBtn'); // 打开侧边栏的按钮对象
    const sidebar = document.getElementById('sidebar'); // 侧边栏
    // 侧边栏按钮被点击的时候，侧边栏被激活，资源管理器出现
    menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // ****** 模型文件夹的操作 ******
    // 模型文件夹
    const modelItem = document.getElementById('modelItem');
    // 模型文件夹子项列表
    const modelSubItems = document.getElementById('modelSubItems');
    // 模型文件夹左侧的箭头
    const modelToggleBtn = document.querySelector('#modelItem .toggle-btn');
    // 当模型文件夹被点击的时候，箭头变为向下，并展开内容
    modelItem.addEventListener('click', function () {
        modelSubItems.style.display = modelSubItems.style.display === 'block' ? 'none' : 'block'; // 展开子项
        modelToggleBtn.classList.toggle('expanded'); // 箭头变换
    });

    // ****** 属性面板操作 ******
    const propertyToggle = document.getElementById('propertyToggle'); // 属性按钮
    const propertyPanel = document.getElementById('propertyPanel');   // 属性面板
    // 属性按钮被点击的时候，属性列表出现
    propertyToggle.addEventListener('click', function () {
        propertyPanel.classList.toggle('active');
    });

    // ****** 可拖拽对象（层）的操作 ******
    // 模型文件夹子项
    const draggableItems = document.querySelectorAll('.sub-item');
    // 模型拖拽放置的区域
    const dropzone = document.getElementById('dropzone');
    let draggedItem = null;

    // 拖拽开始事件，设置模型文件夹子项可拖拽
    draggableItems.forEach(item => {
        item.draggable = true; // 设置模型可拖拽
        item.addEventListener('dragstart', function (e) {
            // 设置拖拽数据（如全连接层）
            e.dataTransfer.setData('text/plain', item.innerText);
            item.classList.add('dragging');    // 设置鼠标指针拖拽中
        });
        item.addEventListener('dragend', function () {
            item.classList.remove('dragging'); // 恢复鼠标指针
        });
    });
    // 拖拽进入放置区域事件
    /*
    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault(); // 允许放置
    });
    */
    //拖拽排序功能
    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(dropzone, e.clientY);
        if (afterElement == null) {
            dropzone.appendChild(draggedItem);
        } else {
            dropzone.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 松开鼠标，完成一个对象的创建
    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        // Step 1：创建拖拽对象
        const data = e.dataTransfer.getData('text/plain');   // 获取拖拽数据
        const draggableItem = document.createElement('div'); // 创建新的拖拽对象
        draggableItem.className = 'draggable-item';          // 添加样式类
        // Step 2：设置对象参数
        let params;
        switch (data) {
            case "全连接层":
                params = { 输入维度: 320, 输出维度: 160, 激活函数: "ReLU" };
                break;
            case "卷积层":
                params = { 卷积核高度: 3, 卷积核宽度: 3, 步长: 2, 填充: 1 };
                break;
            case "池化层":
                params = { 池化方式: "最大池化", 块高度: 2, 块宽度: 2 };
                break;
            case "展平层": // 展平层逻辑
                params = {}; // 展平层不需要参数
                break;
        }
        // Step 3：设置对象内容和数据属性
        draggableItem.innerHTML = `<div>${data}</div>`;
        draggableItem.dataset.type = data;
        draggableItem.dataset.params = JSON.stringify(params);
        // 4. 添加到放置区并自动选中
        dropzone.appendChild(draggableItem);
        selectItem(draggableItem); // 选中

        // 获取dropzone的实际边界（包括边框和内边距）
        const dropzoneRect = dropzone.getBoundingClientRect();
        const dropzoneStyle = window.getComputedStyle(dropzone);
        const borderLeft = parseInt(dropzoneStyle.borderLeftWidth) || 0;
        const borderTop = parseInt(dropzoneStyle.borderTopWidth) || 0;
        const paddingLeft = parseInt(dropzoneStyle.paddingLeft) || 0;
        const paddingTop = parseInt(dropzoneStyle.paddingTop) || 0;
        // 计算dropzone内容区域的起始位置（相对于视口）
        const contentLeft = dropzoneRect.left + borderLeft + paddingLeft;
        const contentTop = dropzoneRect.top + borderTop + paddingTop;
        // 设置拖拽对象的位置（相对于 dropzone 的内容区域）
        draggableItem.style.position = 'absolute';
        draggableItem.style.top = `${e.clientY - contentTop - draggableItem.offsetHeight / 2}px`;
        draggableItem.style.left = `${e.clientX - contentLeft - draggableItem.offsetWidth / 2}px`;
        // 使拖拽对象可拖拽移动
        let offsetX, offsetY;
        draggableItem.addEventListener('mousedown', function (e) {
            offsetX = e.clientX - draggableItem.offsetLeft;
            offsetY = e.clientY - draggableItem.offsetTop;
            document.body.style.userSelect = 'none'; // 禁止文本选择
            draggableItem.classList.add('dragging'); // 添加拖拽时的样式
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // ****** 当鼠标拖拽时，对象应该跟着一起移动 ******
        function onMouseMove(e) {
            draggableItem.style.left = `${e.clientX - offsetX}px`;
            draggableItem.style.top = `${e.clientY - offsetY}px`;
            // 限制拖拽对象在放置区域内移动
            const dropzoneRect = dropzone.getBoundingClientRect();
            const dropzoneStyle = window.getComputedStyle(dropzone);
            const borderLeft = parseInt(dropzoneStyle.borderLeftWidth) || 0;
            const borderTop = parseInt(dropzoneStyle.borderTopWidth) || 0;
            const paddingLeft = parseInt(dropzoneStyle.paddingLeft) || 0;
            const paddingTop = parseInt(dropzoneStyle.paddingTop) || 0;
            const minLeft = borderLeft + paddingLeft;
            const minTop = borderTop + paddingTop;
            const maxLeft = dropzoneRect.width - draggableItem.offsetWidth - borderLeft - paddingLeft;
            const maxTop = dropzoneRect.height - draggableItem.offsetHeight - borderTop - paddingTop;
            if (parseInt(draggableItem.style.left) < minLeft) draggableItem.style.left = `${minLeft}px`;
            if (parseInt(draggableItem.style.top) < minTop) draggableItem.style.top = `${minTop}px`;
            if (parseInt(draggableItem.style.left) > maxLeft) draggableItem.style.left = `${maxLeft}px`;
            if (parseInt(draggableItem.style.top) > maxTop) draggableItem.style.top = `${maxTop}px`;
        }

        // ****** 当鼠标松开时，自动选中 ****** 
        function onMouseUp() {
            draggableItem.classList.remove('dragging'); // 移除拖拽时的样式
            document.body.style.userSelect = ''; // 恢复文本选择
            selectItem(draggableItem); // 选中
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });

    // 选中一个对象
    function selectItem(item) {
        // 清除其他选中状态
        document.querySelectorAll('.draggable-item').forEach(el => {
            el.classList.remove('selected');
        });
        // 设置当前对象选中
        item.classList.add('selected');
        // 解析并显示属性
        const params = JSON.parse(item.dataset.params);
        updatePropertyPanel(params);

        // 自动展开右侧属性面板
        const propertyPanel = document.getElementById('propertyPanel');
        if (!propertyPanel.classList.contains('active')) {
            propertyPanel.classList.add('active');
        }
    }

    // 取消选择
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.draggable-item') &&
            e.target.closest('.dropzone')) {
            document.querySelectorAll('.draggable-item').forEach(el => {
                el.classList.remove('selected');
            });
            const panel = document.getElementById('propertyPanel');
            // 清空现有内容
            panel.innerHTML = `
                <h3>属性列表</h3>
            `;
        }
    });

    // 属性面板更新函数
    function updatePropertyPanel(params) {
        const panel = document.getElementById('propertyPanel');
        // 清空现有内容
        panel.innerHTML = `
            <h3>属性列表</h3>
            <button class="save-btn" id="saveBtn">保存</button>
            <button class="delete-btn">删除</button>
        `;
        if (Object.keys(params).length === 0) {
            const noParamsMessage = document.createElement('div');
            noParamsMessage.textContent = "此层无需参数配置。";
            noParamsMessage.style.color = "#888";
            panel.appendChild(noParamsMessage);
            return;
        }
        // 动态生成属性列表
        for (const [key, value] of Object.entries(params)) {
            const row = document.createElement('div');
            row.className = 'property-row';
            if (key == "激活函数")
                row.innerHTML = `
                    <label>${key}:</label>
                    <select data-key="${key}">
                        <option value="Sigmoid" ${value === "Sigmoid" ? "selected" : ""}>Sigmoid</option>
                        <option value="ReLU" ${value === "ReLU" ? "selected" : ""}>ReLU</option>
                        <option value="LeakyRELU" ${value === "LeakyRELU" ? "selected" : ""}>LeakyRELU</option>
                    </select>
                `;
            else if (key == "池化方式")
                row.innerHTML = `
                    <label>${key}:</label>
                    <select data-key="${key}">
                        <option value="最大池化" ${value === "最大池化" ? "selected" : ""}>最大池化</option>
                        <option value="平均池化" ${value === "平均池化" ? "selected" : ""}>平均池化</option>
                    </select>
                `;
            else row.innerHTML = `
                    <label>${key}:</label>
                    <input type="text" value="${value}" data-key="${key}">
                `
            panel.appendChild(row);
        }

        // 添加保存事件监听
        panel.querySelector('.save-btn').addEventListener('click', () => {
            saveProperties(params);
        });
        // 保存修改后的参数
        function saveProperties(originalParams) {
            const panel = document.getElementById('propertyPanel');
            const updatedParams = {};
            document.querySelectorAll('.property-row [data-key]').forEach(el => {
                updatedParams[el.dataset.key] = el.value; // 自动适配 select/input
            });
            // 收集所有修改后的值
            panel.querySelectorAll('.property-row input').forEach(input => {
                const key = input.dataset.key;
                updatedParams[key] = input.value;
            });
            // 更新到当前选中元素
            const selectedItem = document.querySelector('.draggable-item.selected');
            if (selectedItem) {
                selectedItem.dataset.params = JSON.stringify(updatedParams);
                console.log('属性已保存:', updatedParams);
                alert('保存成功！');
            } else {
                console.warn('没有选中任何元素');
            }
        }
        // 删除对象
        panel.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('确定要删除此对象吗？')) {
                const selectedItem = document.querySelector('.draggable-item.selected');
                if (selectedItem) {
                    selectedItem.remove();
                    alert('删除成功！');
                    const panel = document.getElementById('propertyPanel');
                    // 清空现有内容
                    panel.innerHTML = `
                <h3>属性列表</h3>
            `;
                } else {
                    console.warn('没有选中任何元素');
                }
            }
        });
    }

    // 获取“开始训练”按钮
    const startTrainingBtn = document.getElementById('startTrainingBtn');
    // 为“开始训练”按钮添加点击事件监听器
    startTrainingBtn.addEventListener('click', () => {
        const layers = [];
        const draggableItems = document.querySelectorAll('.draggable-item');
        draggableItems.forEach(item => {
            const type = item.dataset.type;
            const params = JSON.parse(item.dataset.params);
            let layer;
            switch (type) {
                case "全连接层":
                    layer = {
                        type: "Linear",
                        name: `fc${layers.length + 1}`,
                        params: {
                            in_features: parseInt(params["输入维度"]),
                            out_features: parseInt(params["输出维度"]),
                            activation: params["激活函数"]
                        }
                    };
                    break;
                case "卷积层":
                    layer = {
                        type: "Conv2d",
                        name: `conv${layers.length + 1}`,
                        params: {
                            in_channels: 1, // 假设默认值为 1，可根据实际情况修改
                            out_channels: 1, // 假设默认值为 1，可根据实际情况修改
                            kernel_size: parseInt(params["卷积核高度"]),
                            stride: parseInt(params["步长"]),
                            padding: parseInt(params["填充"])
                        }
                    };
                    break;
                case "池化层":
                    layer = {
                        type: "MaxPool2d",
                        name: `pool${layers.length + 1}`,
                        params: {
                            kernel_size: parseInt(params["块高度"]),
                            stride: parseInt(params["块宽度"]),
                            padding: 0
                        }
                    };
                    break;
                case "展平层":
                    layer = {
                        type: "Flatten",
                        name: `flatten${layers.length + 1}`,
                        params: {} // 展平层不需要参数
                    };
                    break;   
            }
            layers.push(layer);
        });

        const data = {
            layers: layers
        };

        // 使用 fetch 发送数据到后端，假设后端地址为 'http://your-backend-url'
        fetch('http://localhost:5000/generate', { // 假设后端运行在本地 5000 端口，根据实际情况修改
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
       .then(async response => {
        const result = await response.json();
        console.log('后端响应:', result);
    
        if (response.ok && result.success) {
            alert(' 模型代码生成成功！');
            showCodePopup(result.data);
        } else {
            alert(`生成失败：${result.error.message || '未知错误'}`);
        }
        })
       .catch(error => {
            console.error('发送数据时出错:', error);
            alert('发送数据失败，请检查网络连接！');
        });
    });
});

function showCodePopup(code) {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = 1000;

    // 创建弹出框
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.width = '80%';
    popup.style.maxWidth = '600px';
    popup.style.backgroundColor = '#fff';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.padding = '20px';
    popup.style.zIndex = 1001;

    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '生成的代码';
    title.style.marginBottom = '10px';
    popup.appendChild(title);

    // 添加代码显示区域
    const codeArea = document.createElement('pre');
    codeArea.textContent = code;
    codeArea.style.backgroundColor = '#f4f4f4';
    codeArea.style.padding = '10px';
    codeArea.style.border = '1px solid #ddd';
    codeArea.style.borderRadius = '4px';
    codeArea.style.overflowX = 'auto';
    popup.appendChild(codeArea);

    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制代码';
    copyButton.style.marginTop = '10px';
    copyButton.style.padding = '8px 16px';
    copyButton.style.backgroundColor = '#1890ff';
    copyButton.style.color = '#fff';
    copyButton.style.border = 'none';
    copyButton.style.borderRadius = '4px';
    copyButton.style.cursor = 'pointer';
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
            alert('代码已复制到剪贴板！');
        });
    });
    popup.appendChild(copyButton);

    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '关闭';
    closeButton.style.marginLeft = '10px';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#ff4d4f';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
    });
    popup.appendChild(closeButton);

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}