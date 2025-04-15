// 用于标记是否是新拖入的元素
let isNewDrag = true;
let draggedElement = null;
let startX, startY; // 记录鼠标按下时的初始位置

/* 打开侧边栏的函数 */
function openNav() {
    document.getElementById("myLeft-column").style.width = "250px";
    document.querySelector('.open-button').style.color = '#fff';
    document.querySelector('.middle-column').style.marginLeft = "250px";
}

/* 关闭侧边栏的函数 */
function closeNav() {
    document.getElementById("myLeft-column").style.width = "0";
    document.querySelector('.open-button').style.color = '#000';
    document.querySelector('.middle-column').style.marginLeft = "0";
}

/* 切换子菜单项显示和隐藏的函数 */
function toggleSubItems(element) {
    element.classList.toggle("active");
    var subItems = element.nextElementSibling;
    if (subItems.style.display === "block") {
        subItems.style.display = "none";
    } else {
        subItems.style.display = "block";
    }
}

/* 拖拽开始事件处理函数 */
function dragStart(event) {
    // 创建一个图片元素
    var img = new Image();
    // 设置图片路径，这里需要替换为你的实际图片路径
    img.src = "全连接层图片.png";
    // 设置图片宽度和高度
    img.width = 80;
    img.height = 80;
    // 设置拖拽时显示的图片
    event.dataTransfer.setDragImage(img, 0, 0);
    // 设置拖拽数据
    event.dataTransfer.setData("text/plain", event.target.textContent);
    isNewDrag = true;
    draggedElement = null;
}

/* 拖拽进入事件处理函数 */
function dragEnter(event) {
    event.preventDefault();
}

/* 拖拽悬停事件处理函数 */
function dragOver(event) {
    event.preventDefault();
}

let draggedElements = []; // 用于记录拖拽元素的顺序

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text/plain");
    var dropArea = document.querySelector('.drop-area');
    var rect = dropArea.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (isNewDrag) {
        // 创建一个新的图片元素
        var newImg = new Image();
        newImg.src = "全连接层图片.png";
        newImg.classList.add('dropped-image');
        newImg.style.left = x + 'px';
        newImg.style.top = y + 'px';
        dropArea.appendChild(newImg);

        // 记录拖拽元素的顺序
        draggedElements.push(newImg);

        // 如果拖拽的元素超过一个，绘制箭头
        if (draggedElements.length > 1) {
            drawArrow(draggedElements[draggedElements.length - 2], newImg);
        }

        // 创建删除提示元素
        var deleteHint = document.createElement('div');
        deleteHint.classList.add('delete-hint');
        deleteHint.textContent = '删除';
        dropArea.appendChild(deleteHint);

        // 为删除提示关联对应的图片元素
        deleteHint.associatedImage = newImg;

        // 添加鼠标进入事件监听器
        newImg.addEventListener('mouseenter', function () {
            var imgRect = this.getBoundingClientRect();
            var dropRect = dropArea.getBoundingClientRect();
            deleteHint.style.left = imgRect.left - dropRect.left + 20 + 'px';
            deleteHint.style.top = imgRect.top - dropRect.top - 20 + 'px';
            deleteHint.style.display = 'block';
        });

        // 添加鼠标离开事件监听器，增加对删除提示的判断
        newImg.addEventListener('mouseleave', function (e) {
            var deleteHintRect = deleteHint.getBoundingClientRect();
            if (
                e.clientX < deleteHintRect.left ||
                e.clientX > deleteHintRect.right ||
                e.clientY < deleteHintRect.top ||
                e.clientY > deleteHintRect.bottom
            ) {
                deleteHint.style.display = 'none';
            }
        });

        // 添加点击删除提示事件监听器
        deleteHint.addEventListener('click', function () {
            if (this.associatedImage) {
                dropArea.removeChild(this.associatedImage);
                // 从数组中移除被删除的元素
                draggedElements = draggedElements.filter(el => el !== this.associatedImage);
                // 重新绘制箭头
                redrawArrows();
            }
            dropArea.removeChild(this);
            checkAndShowHint();
        });

        // 添加鼠标按下事件监听器，用于后续移动图片
        newImg.addEventListener('mousedown', function (e) {
            isNewDrag = false;
            draggedElement = this;
            startX = e.clientX;
            startY = e.clientY;

            // 添加鼠标移动事件监听器
            document.addEventListener('mousemove', function (e) {
                if (draggedElement) {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    draggedElement.style.left = parseInt(draggedElement.style.left) + dx + 'px';
                    draggedElement.style.top = parseInt(draggedElement.style.top) + dy + 'px';
                    startX = e.clientX;
                    startY = e.clientY;
                    // 重新绘制箭头
                    redrawArrows();
                }
            });

            // 添加鼠标松开事件监听器
            document.addEventListener('mouseup', function () {
                draggedElement = null;
            });
        });

        // 隐藏提示框
        var hint = document.querySelector('.drag-hint');
        hint.style.display = 'none';
    } else if (draggedElement) {
        // 更新已有元素的位置
        draggedElement.style.left = x + 'px';
        draggedElement.style.top = y + 'px';
        draggedElement = null;
    }
}

// 绘制箭头
function drawArrow(fromElement, toElement) {
    var dropArea = document.querySelector('.drop-area');
    var svgNS = "http://www.w3.org/2000/svg";
    var arrow = document.createElementNS(svgNS, "line");

    // 获取元素的中心点
    var fromRect = fromElement.getBoundingClientRect();
    var toRect = toElement.getBoundingClientRect();
    var dropRect = dropArea.getBoundingClientRect();

    var x1 = fromRect.left - dropRect.left + fromRect.width / 2;
    var y1 = fromRect.top - dropRect.top + fromRect.height / 2;
    var x2 = toRect.left - dropRect.left + toRect.width / 2;
    var y2 = toRect.top - dropRect.top + toRect.height / 2;

    arrow.setAttribute("x1", x1);
    arrow.setAttribute("y1", y1);
    arrow.setAttribute("x2", x2);
    arrow.setAttribute("y2", y2);
    arrow.setAttribute("stroke", "black");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("marker-end", "url(#arrowhead)");

    // 添加箭头到 SVG
    var svg = document.querySelector('.arrow-svg');
    if (!svg) {
        svg = document.createElementNS(svgNS, "svg");
        svg.classList.add('arrow-svg');
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        svg.style.pointerEvents = "none"; // 防止箭头遮挡拖拽区域
        dropArea.appendChild(svg);

        // 定义箭头头部
        var defs = document.createElementNS(svgNS, "defs");
        var marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "9");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        var path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M0,0 L0,7 L10,3.5 Z");
        path.setAttribute("fill", "black");
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }
    svg.appendChild(arrow);
}

// 重新绘制所有箭头
function redrawArrows() {
    var svg = document.querySelector('.arrow-svg');
    if (svg) {
        svg.innerHTML = ''; // 清空所有箭头
        // 重新定义箭头头部
        var svgNS = "http://www.w3.org/2000/svg";
        var defs = document.createElementNS(svgNS, "defs");
        var marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "9");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        var path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", "M0,0 L0,7 L10,3.5 Z");
        path.setAttribute("fill", "black");
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // 重新绘制所有箭头
        for (let i = 1; i < draggedElements.length; i++) {
            drawArrow(draggedElements[i - 1], draggedElements[i]);
        }
    }
}

function checkAndShowHint() {
    var dropArea = document.querySelector('.drop-area');
    var droppedImages = dropArea.querySelectorAll('.dropped-image');
    var hint = document.querySelector('.drag-hint');
    if (droppedImages.length === 0) {
        hint.style.display = 'block';
    }
}

function showParameters() {
    var select = document.getElementById('layer-select');
    var data = select.value;
    var parameterInputs = document.getElementById('parameter-inputs');
    parameterInputs.innerHTML = '';

    if (data === '全连接层') {
        var inputDimLabel = document.createElement('label');
        inputDimLabel.textContent = '输入向量的维数: ';
        var inputDimInput = document.createElement('input');
        inputDimInput.type = 'number';
        parameterInputs.appendChild(inputDimLabel);
        parameterInputs.appendChild(inputDimInput);

        var outputDimLabel = document.createElement('label');
        outputDimLabel.textContent = '输出向量的维数: ';
        var outputDimInput = document.createElement('input');
        outputDimInput.type = 'number';
        parameterInputs.appendChild(outputDimLabel);
        parameterInputs.appendChild(outputDimInput);
    } else if (data === '卷积层') {
        var kernelSizeLabel = document.createElement('label');
        kernelSizeLabel.textContent = 'kernel_size: ';
        var kernelSizeInput = document.createElement('input');
        kernelSizeInput.type = 'number';
        parameterInputs.appendChild(kernelSizeLabel);
        parameterInputs.appendChild(kernelSizeInput);

        var numFiltersLabel = document.createElement('label');
        numFiltersLabel.textContent = 'Number of Filters: ';
        var numFiltersInput = document.createElement('input');
        numFiltersInput.type = 'number';
        parameterInputs.appendChild(numFiltersLabel);
        parameterInputs.appendChild(numFiltersInput);

        var strideLabel = document.createElement('label');
        strideLabel.textContent = 'stride: ';
        var strideInput = document.createElement('input');
        strideInput.type = 'number';
        parameterInputs.appendChild(strideLabel);
        parameterInputs.appendChild(strideInput);

        var paddingLabel = document.createElement('label');
        paddingLabel.textContent = 'padding: ';
        var paddingInput = document.createElement('input');
        paddingInput.type = 'number';
        parameterInputs.appendChild(paddingLabel);
        parameterInputs.appendChild(paddingInput);

        var inChannelsLabel = document.createElement('label');
        inChannelsLabel.textContent = 'in_channels: ';
        var inChannelsInput = document.createElement('input');
        inChannelsInput.type = 'number';
        parameterInputs.appendChild(inChannelsLabel);
        parameterInputs.appendChild(inChannelsInput);
    } else if (data === '池化层') {
        // 选择最大池化还是平均池化
        var poolTypeLabel = document.createElement('label');
        poolTypeLabel.textContent = '池化类型: ';
        var poolTypeSelect = document.createElement('select');
        var maxPoolOption = document.createElement('option');
        maxPoolOption.value = '最大池化';
        maxPoolOption.textContent = '最大池化';
        var avgPoolOption = document.createElement('option');
        avgPoolOption.value = '平均池化';
        avgPoolOption.textContent = '平均池化';
        poolTypeSelect.appendChild(maxPoolOption);
        poolTypeSelect.appendChild(avgPoolOption);
        parameterInputs.appendChild(poolTypeLabel);
        parameterInputs.appendChild(poolTypeSelect);

        // kernel_size
        var kernelSizeLabel = document.createElement('label');
        kernelSizeLabel.textContent = 'kernel_size: ';
        var kernelSizeInput = document.createElement('input');
        kernelSizeInput.type = 'number';
        parameterInputs.appendChild(kernelSizeLabel);
        parameterInputs.appendChild(kernelSizeInput);

        // stride
        var strideLabel = document.createElement('label');
        strideLabel.textContent = 'stride: ';
        var strideInput = document.createElement('input');
        strideInput.type = 'number';
        parameterInputs.appendChild(strideLabel);
        parameterInputs.appendChild(strideInput);

        // padding
        var paddingLabel = document.createElement('label');
        paddingLabel.textContent = 'padding: ';
        var paddingInput = document.createElement('input');
        paddingInput.type = 'number';
        parameterInputs.appendChild(paddingLabel);
        parameterInputs.appendChild(paddingInput);
    } else if (data === '归一化层') {
        var normTypeLabel = document.createElement('label');
        normTypeLabel.textContent = '归一化类型: ';
        var normTypeSelect = document.createElement('select');
        var batchNormOption = document.createElement('option');
        batchNormOption.value = 'batch norm';
        batchNormOption.textContent = 'batch norm';
        var layerNormOption = document.createElement('option');
        layerNormOption.value = 'layer norm';
        layerNormOption.textContent = 'layer norm';
        normTypeSelect.appendChild(batchNormOption);
        normTypeSelect.appendChild(layerNormOption);
        parameterInputs.appendChild(normTypeLabel);
        parameterInputs.appendChild(normTypeSelect);
    } else if (data === 'dropout 层') {
        var pLabel = document.createElement('label');
        pLabel.textContent = 'p 值: ';
        var pInput = document.createElement('input');
        pInput.type = 'number';
        pInput.min = 0;
        pInput.max = 1;
        parameterInputs.appendChild(pLabel);
        parameterInputs.appendChild(pInput);
    }

    // 展开输入区域，设置一个足够大的值
    var inputArea = document.querySelector('.input-area');
    inputArea.style.maxHeight = '3000px';

    // 显示收起参数按钮
    var collapseButton = document.createElement('button');
    collapseButton.classList.add('collapse-button');
    collapseButton.textContent = '收起参数';
    collapseButton.addEventListener('click', collapseParameters);
    inputArea.appendChild(collapseButton);

    // 显示提交按钮
    var submitButton = document.createElement('button');
    submitButton.textContent = '提交';
    submitButton.addEventListener('click', submitForm);
    submitButton.classList.add('submit-button'); // 添加类名 submit-button
    inputArea.appendChild(submitButton);
}

function submitForm() {
    var select = document.getElementById('layer-select');
    var layer = select.value;
    var parameterInputs = document.getElementById('parameter-inputs');
    var inputs = parameterInputs.querySelectorAll('input, select');
    var formData = { layer: layer };

    // 清空右侧栏的属性列表
    var attributeList = document.getElementById('attribute-list');
    attributeList.innerHTML = '';

    // 添加当前选中的层
    var layerInfo = document.createElement('p');
    layerInfo.textContent = `当前层: ${layer}`;
    attributeList.appendChild(layerInfo);

    // 添加用户输入的参数
    inputs.forEach(input => {
        var label = input.previousElementSibling.textContent.replace(': ', '');
        var value = input.value;
        formData[label] = value;

        var paramInfo = document.createElement('p');
        paramInfo.textContent = `${label}: ${value}`;
        attributeList.appendChild(paramInfo);
    });

    console.log(formData);
    // 这里可以添加将数据发送到服务器的代码
}

function collapseParameters() {
    var inputArea = document.querySelector('.input-area');
    var parameterInputs = document.getElementById('parameter-inputs');
    parameterInputs.innerHTML = '';
    inputArea.style.maxHeight = '100px';
    // 移除收起参数按钮
    var collapseButton = document.querySelector('.collapse-button');
    if (collapseButton) {
        inputArea.removeChild(collapseButton);
    }
    // 移除提交按钮
    var submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        inputArea.removeChild(submitButton);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // 为全连接层元素添加 draggable 属性和 dragstart 事件监听器
    var fcLayer = document.querySelector('.model-sub-items .model-item:nth-child(1)');
    fcLayer.setAttribute('draggable', 'true');
    fcLayer.addEventListener('dragstart', dragStart);

    // 为卷积层元素添加 draggable 属性和 dragstart 事件监听器
    var convLayer = document.querySelector('.model-sub-items .model-item:nth-child(2)');
    convLayer.setAttribute('draggable', 'true');
    convLayer.addEventListener('dragstart', dragStart);

    // 为池化层元素添加 draggable 属性和 dragstart 事件监听器
    var poolLayer = document.querySelector('.model-sub-items .model-item:nth-child(3)');
    poolLayer.setAttribute('draggable', 'true');
    poolLayer.addEventListener('dragstart', dragStart);

    // 为归一化层元素添加 draggable 属性和 dragstart 事件监听器
    var normLayer = document.querySelector('.model-sub-items .model-item:nth-child(4)');
    normLayer.setAttribute('draggable', 'true');
    normLayer.addEventListener('dragstart', dragStart);

    // 为 dropout 层元素添加 draggable 属性和 dragstart 事件监听器
    var dropoutLayer = document.querySelector('.model-sub-items .model-item:nth-child(5)');
    dropoutLayer.setAttribute('draggable', 'true');
    dropoutLayer.addEventListener('dragstart', dragStart);

    // 为中间栏的可拖拽区域添加拖拽相关事件监听器
    var dropArea = document.querySelector('.drop-area');
    dropArea.addEventListener('dragenter', dragEnter);
    dropArea.addEventListener('dragover', dragOver);
    dropArea.addEventListener('drop', drop);

    // 修改提交按钮文本为确定
    var submitButton = document.querySelector('.input-area button');
    submitButton.textContent = '确定';
    submitButton.addEventListener('click', function () {
        var parameterInputs = document.getElementById('parameter-inputs');
        if (parameterInputs.children.length === 0) {
            showParameters();
        }
    });
});

function createCodeInput() {
    // 获取拖拽区域
    var dropArea = document.querySelector('.drop-area');
    // 隐藏拖拽提示
    var dragHint = document.querySelector('.drag-hint');
    dragHint.style.display = 'none';

    // 创建 Monaco Editor 的容器元素
    var editorContainer = document.createElement('div');
    editorContainer.classList.add('monaco-editor');
    dropArea.appendChild(editorContainer);

    // 创建关闭按钮元素
    var closeButton = document.createElement('button');
    closeButton.classList.add('close-monaco-editor');
    closeButton.textContent = '×';
    editorContainer.appendChild(closeButton);

    // 为关闭按钮添加点击事件监听器
    closeButton.addEventListener('click', function () {
        editorContainer.style.display = 'none';
        // 如果需要完全移除容器，可以使用以下代码
        // dropArea.removeChild(editorContainer);
    });

    // 创建提交按钮元素
    var submitButton = document.createElement('button');
    submitButton.classList.add('submit-code-button');
    submitButton.textContent = '提交';
    editorContainer.appendChild(submitButton);

    // 为提交按钮添加点击事件监听器
    submitButton.addEventListener('click', function () {
        // 这里可以添加提交代码的逻辑，例如获取代码内容并发送到服务器
        var editor = monaco.editor.getModels()[0];
        var code = editor.getValue();
        console.log('提交的代码:', code);
    });

    // 配置 Monaco Editor
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        try {
            var editor = monaco.editor.create(editorContainer, {
                value: [
                    '// 在这里输入你的自定义神经网络代码',
                    '// 例如 Python 代码',
                    'import torch',
                    'import torch.nn as nn'
                ].join('\n'),
                language: 'python',
                theme: 'vs-dark', // 可以根据喜好选择主题，如 'vs'（浅色主题）或 'vs-dark'（深色主题）
                automaticLayout: true
            });
        } catch (error) {
            console.error('Monaco Editor 创建失败:', error);
        }
    }, function (error) {
        console.error('Monaco Editor 资源加载失败:', error);
    });
}
