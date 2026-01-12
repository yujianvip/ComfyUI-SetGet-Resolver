# ComfyUI Set/Get Resolver

这是一个简单的辅助插件，用于将 `KJNodes` 的 **Set Node** 和 **Get Node** 逻辑连接转换为真实的物理连线。

### 功能
在 ComfyUI 画布空白处点击**右键**，选择 **"⚡ Replace Set/Get with Wires"**。

脚本会：
1. 查找所有配对的 Set/Get 节点。
2. 将 Set 的上游直接连到 Get 的下游。
3. 询问是否删除原本的 Set/Get 节点。

### 适用场景
当你使用 Set/Get 整理了工作流，但在分享给别人或进行 Debug 时，希望恢复直观的连线状态时使用。