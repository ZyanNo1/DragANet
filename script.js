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
    // 拖拽开始事件
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
    dropzone.addEventListener('dragover', function (e) {
        e.preventDefault(); // 允许放置
    });
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
                params = { 池化方式: "最大池化", 块高度: 2, 块高度: 2 };
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
    }

    // 取消选择
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.draggable-item') &&
            !e.target.closest('#property-panel')) {
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
        // 动态生成属性列表
        for (const [key, value] of Object.entries(params)) {
            const row = document.createElement('div');
            row.className = 'property-row';
            if (key == "激活函数")
                row.innerHTML = `
                    <label>${key}:</label>
                    <select data-key="${key}">
                        <option value="Sigmoid">Sigmoid</option>
                        <option value="ReLU">ReLU</option>
                        <option value="LeakyRELU">LeakyRELU</option>
                    </select>
                `;
            else if (key == "池化方式")
                row.innerHTML = `
                    <label>${key}:</label>
                    <select data-key="${key}">
                        <option value="最大池化">最大池化</option>
                        <option value="平均池化">平均池化</option>
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
                } else {
                    console.warn('没有选中任何元素');
                }
            }
        });
    }
});