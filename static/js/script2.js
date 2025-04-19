document.addEventListener('DOMContentLoaded', function () {
    const dropzone = document.getElementById('dropzone');
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const propertyPanel = document.getElementById('propertyPanel');
    const propertyToggle = document.getElementById('propertyToggle');
    let draggedItem = null;

    // ****** 侧边栏功能 ******
    menuBtn.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // ****** 模型文件夹展开/折叠功能 ******
    const modelItem = document.getElementById('modelItem');
    const modelSubItems = document.getElementById('modelSubItems');
    const modelToggleBtn = document.querySelector('#modelItem .toggle-btn');

    modelItem.addEventListener('click', function () {
        if (modelSubItems.style.display === 'block') {
            modelSubItems.style.display = 'none';
            modelToggleBtn.classList.remove('expanded'); // 箭头向右
        } else {
            modelSubItems.style.display = 'block';
            modelToggleBtn.classList.add('expanded'); // 箭头向下
        }
    });

    // ****** 属性列表展开/缩回功能 ******
    propertyToggle.addEventListener('click', function () {
        propertyPanel.classList.toggle('active'); // 切换 active 类
    });

    // ****** 拖拽排序功能 ******
    dropzone.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('draggable-item')) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        }
    });

    dropzone.addEventListener('dragend', function (e) {
        if (e.target.classList.contains('draggable-item')) {
            e.target.classList.remove('dragging');
            draggedItem = null;
        }
    });

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

    // ****** 拖拽完成后创建新对象 ******
    dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const draggableItem = document.createElement('div');
        draggableItem.className = 'draggable-item';
        draggableItem.draggable = true;
        draggableItem.innerHTML = `<div>${data}</div>`;
        draggableItem.dataset.type = data;
        draggableItem.dataset.params = JSON.stringify(getDefaultParams(data));
        dropzone.appendChild(draggableItem);

        // 添加拖拽事件
        draggableItem.addEventListener('dragstart', function (e) {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        });
        draggableItem.addEventListener('dragend', function (e) {
            e.target.classList.remove('dragging');
        });

        // 点击选中对象并显示属性
        draggableItem.addEventListener('click', function () {
            selectItem(draggableItem);
        });
    });

    function getDefaultParams(type) {
        switch (type) {
            case "全连接层":
                return { 输入维度: 320, 输出维度: 160, 激活函数: "ReLU" };
            case "卷积层":
                return { 卷积核高度: 3, 卷积核宽度: 3, 步长: 2, 填充: 1 };
            case "池化层":
                return { 池化方式: "最大池化", 块高度: 2, 块宽度: 2 };
            case "展平层":
                return {};
            default:
                return {};
        }
    }

    // ****** 属性面板功能 ******
    function selectItem(item) {
        document.querySelectorAll('.draggable-item').forEach(el => {
            el.classList.remove('selected');
        });
        item.classList.add('selected');
        const params = JSON.parse(item.dataset.params);
        updatePropertyPanel(params);
        if (!propertyPanel.classList.contains('active')) {
            propertyPanel.classList.add('active');
        }
    }

    function updatePropertyPanel(params) {
        propertyPanel.innerHTML = `
            <h3>属性列表</h3>
            <button class="save-btn">保存</button>
            <button class="delete-btn">删除</button>
        `;
        if (Object.keys(params).length === 0) {
            const noParamsMessage = document.createElement('div');
            noParamsMessage.textContent = "此层无需参数配置。";
            noParamsMessage.style.color = "#888";
            propertyPanel.appendChild(noParamsMessage);
            return;
        }
        for (const [key, value] of Object.entries(params)) {
            const row = document.createElement('div');
            row.className = 'property-row';
            row.innerHTML = `
                <label>${key}:</label>
                <input type="text" value="${value}" data-key="${key}">
            `;
            propertyPanel.appendChild(row);
        }

        // 保存属性
        propertyPanel.querySelector('.save-btn').addEventListener('click', () => {
            const updatedParams = {};
            document.querySelectorAll('.property-row [data-key]').forEach(el => {
                updatedParams[el.dataset.key] = el.value;
            });
            const selectedItem = document.querySelector('.draggable-item.selected');
            if (selectedItem) {
                selectedItem.dataset.params = JSON.stringify(updatedParams);
                alert('属性已保存！');
            }
        });

        // 删除对象
        propertyPanel.querySelector('.delete-btn').addEventListener('click', () => {
            const selectedItem = document.querySelector('.draggable-item.selected');
            if (selectedItem) {
                selectedItem.remove();
                propertyPanel.innerHTML = `<h3>属性列表</h3>`;
                alert('对象已删除！');
            }
        });
    }
});