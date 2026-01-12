import { app } from "../../scripts/app.js";

// 注册扩展
app.registerExtension({
    name: "ComfyUI.SetGetResolver",
    async setup() {
        const originalGetCanvasMenuOptions = LGraphCanvas.prototype.getCanvasMenuOptions;
        
        LGraphCanvas.prototype.getCanvasMenuOptions = function () {
            const options = originalGetCanvasMenuOptions.apply(this, arguments);
            options.push(null); // 分隔线
            options.push({
                content: "⚡ Replace Set/Get with Wires", 
                callback: () => {
                    initiateResolver();
                }
            });
            return options;
        }
    }
});

// 主入口
function initiateResolver() {
    const graph = app.graph;
    const allNodes = graph._nodes;
    
    if (!allNodes || allNodes.length === 0) return;

    // --- 步骤 1: 扫描并匹配节点 (不进行修改) ---
    
    const setNodes = [];
    const getNodes = [];
    
    // 宽容的节点查找逻辑
    for (const node of allNodes) {
        if (!node.type) continue;
        const typeLower = node.type.toLowerCase();
        const titleLower = node.title ? node.title.toLowerCase() : "";

        // 判断是否为 Set 或 Get 节点
        const isSet = typeLower.includes("setnode") || (typeLower.includes("set") && typeLower.includes("node") && titleLower.includes("set"));
        const isGet = typeLower.includes("getnode") || (typeLower.includes("get") && typeLower.includes("node") && titleLower.includes("get"));

        if (isSet) setNodes.push(node);
        else if (isGet) getNodes.push(node);
    }

    if (setNodes.length === 0 && getNodes.length === 0) {
        alert("No Set/Get nodes found.");
        return;
    }

    // 建立变量映射
    const varMap = new Map();
    
    // 辅助函数：获取变量名
    function getFirstStringWidgetValue(node) {
        if (!node.widgets) return null;
        for (const w of node.widgets) {
            if (w.type === "text" || typeof w.value === "string") return w.value;
        }
        return null;
    }

    // 分析 Set 节点
    for (const sNode of setNodes) {
        const varName = getFirstStringWidgetValue(sNode);
        if (!varName) continue; // 没有变量名
        if (!sNode.inputs || !sNode.inputs[0] || sNode.inputs[0].link === null) continue; // 没连线

        const linkId = sNode.inputs[0].link;
        const linkInfo = graph.links[linkId];
        if (!linkInfo) continue;

        varMap.set(varName, {
            sourceNode: graph.getNodeById(linkInfo.origin_id),
            sourceSlot: linkInfo.origin_slot,
            setNode: sNode
        });
    }

    // 分析 Get 节点，准备操作列表
    const operations = []; // 存储待执行的操作对象
    const nodesToDelete = new Set();

    for (const gNode of getNodes) {
        const varName = getFirstStringWidgetValue(gNode);
        if (!varName) continue;

        const sourceData = varMap.get(varName);
        if (sourceData) {
            // 记录这对匹配，稍后处理
            operations.push({
                getNode: gNode,
                sourceNode: sourceData.sourceNode,
                sourceSlot: sourceData.sourceSlot
            });
            
            // 标记相关的 Set 和 Get 为待删除
            nodesToDelete.add(gNode);
            nodesToDelete.add(sourceData.setNode);
        }
    }

    // --- 步骤 2: 如果没有匹配，直接退出 ---
    if (operations.length === 0) {
        alert("Found Set/Get nodes, but no matching pairs connected.");
        return;
    }

    // --- 步骤 3: 弹出自定义 UI 供用户选择 ---
    showSelectionDialog(operations, nodesToDelete);
}

// 显示自定义弹窗
function showSelectionDialog(operations, nodesToDelete) {
    // 创建遮罩层
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: "10000",
        display: "flex", justifyContent: "center", alignItems: "center"
    });

    // 创建对话框
    const dialog = document.createElement("div");
    Object.assign(dialog.style, {
        backgroundColor: "#353535", color: "#fff", padding: "20px", borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)", minWidth: "300px", fontFamily: "Arial, sans-serif",
        border: "1px solid #555"
    });

    // 标题和内容
    const title = document.createElement("h3");
    title.innerText = "⚡ Set/Get Resolver";
    title.style.marginTop = "0";
    
    const msg = document.createElement("p");
    msg.innerText = `Found ${operations.length} matching connections.\nSelect an action:`;
    msg.style.lineHeight = "1.5";

    // 按钮容器
    const btnContainer = document.createElement("div");
    Object.assign(btnContainer.style, {
        display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px"
    });

    // 通用按钮样式生成器
    const createBtn = (text, color, clickHandler) => {
        const btn = document.createElement("button");
        btn.innerText = text;
        Object.assign(btn.style, {
            padding: "8px 16px", cursor: "pointer", border: "none", borderRadius: "4px",
            backgroundColor: color, color: "white", fontSize: "14px"
        });
        btn.onmouseover = () => btn.style.filter = "brightness(1.2)";
        btn.onmouseout = () => btn.style.filter = "brightness(1.0)";
        btn.onclick = () => {
            document.body.removeChild(overlay); // 关闭弹窗
            clickHandler(); // 执行回调
        };
        return btn;
    };

    // 1. 取消按钮
    const btnCancel = createBtn("Cancel", "#666", () => {
        // 什么都不做
    });

    // 2. 仅连线按钮 (蓝色)
    const btnWireOnly = createBtn("Wire Only", "#2196F3", () => {
        applyChanges(operations, null); // 传 null 表示不删除
    });

    // 3. 连线并删除按钮 (红色)
    const btnWireDelete = createBtn("Wire & Delete", "#f44336", () => {
        applyChanges(operations, nodesToDelete);
    });

    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnWireOnly);
    btnContainer.appendChild(btnWireDelete);

    dialog.appendChild(title);
    dialog.appendChild(msg);
    dialog.appendChild(btnContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

// --- 步骤 4: 执行具体的图谱修改 ---
function applyChanges(operations, nodesToDelete) {
    const graph = app.graph;
    graph.change(); // 开启撤销组 (Undo Group)

    let connectedCount = 0;

    // 执行连线
    for (const op of operations) {
        const { getNode, sourceNode, sourceSlot } = op;
        
        // 检查 Get 节点的输出
        if (getNode.outputs && getNode.outputs[0] && getNode.outputs[0].links) {
            const links = [...getNode.outputs[0].links]; // 复制一份副本
            
            for (const linkId of links) {
                const linkInfo = graph.links[linkId];
                if (!linkInfo) continue;

                const targetNode = graph.getNodeById(linkInfo.target_id);
                const targetSlot = linkInfo.target_slot;

                // *** 物理连接 ***
                sourceNode.connect(sourceSlot, targetNode, targetSlot);
                connectedCount++;
            }
        }
    }

    // 执行删除 (如果传了集合)
    if (nodesToDelete) {
        for (const node of nodesToDelete) {
            graph.remove(node);
        }
    }

    graph.change(); // 结束撤销组
    app.graph.setDirtyCanvas(true, true); // 刷新画布

    // 简单提示结果
    const action = nodesToDelete ? "rewired & deleted nodes" : "rewired only";
    console.log(`[SetGetResolver] Processed ${operations.length} pairs, created ${connectedCount} wires, ${action}.`);
}