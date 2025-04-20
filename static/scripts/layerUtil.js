/******************************
 * 输入张量定义
 ******************************/

/* 一维张量
 * 类名：OneDimTensor
 * 成员变量：
 *    dim：维度大小
 *    objectRef：网页的对象引用
 */
class OneDimTensor {
    constructor(dim = 1024, objectRef) {
        this.dim = dim;
        this.objectRef = objectRef;
    }
    // 输出，用于调试
    describe() {
        console.log(`OneDimTensor: \n
            dim: ${this.dim}, \n
        `);
    }
};

/******************************
 * 神经网络层的类定义
 ******************************/

/* 线性神经网络
 * 类名：LinearLayer
 * 成员变量：
 *   inputDim：输入向量的维度
 *   outputDim：输出向量的维度
 *   activitionFunc：激活函数
 *   objectRef：网页的对象引用
 */
class LinearLayer {
    constructor(inputDim = 256, outputDim = 512,
        activationFunc = 'ReLU', objectRef) {
        this.inputDim = inputDim;
        this.outputDim = outputDim;
        this.activationFunc = activationFunc;
        this.objectRef = objectRef;
    }
    // 输出，用于调试
    describe() {
        console.log(`LinearLayer: \n
            input dim: ${this.inputDim}, \n
            output dim: ${this.outputDim}, \n
            activition func: ${this.activationFunc}, \n
        `);
    }
}

/******************************
 * 神经网络连接的类定义
 ******************************/

/* 两个神经网络的连接，决定网络的顺序
 * 类名：LayerConnection
 * 成员变量：
 *   startLayer：开始层
 *   endLayer：结束层
 *   objectRef：网页的对象引用
 */
class LayerConnection {
    constructor(startLayer, endLayer, objectRef) {
        this.startLayer = startLayer;
        this.endLayer = endLayer;
        this.objectRef = objectRef;
    }
    // 输出，用于调试
    describe() {
        console.log(`Connection: \n
            start layer: 
                ${Object.prototype.toString.call(this.startLayer)}, \n
            end layer: 
                ${Object.prototype.toString.call(this.endLayer)}, \n
        `)
    }
}