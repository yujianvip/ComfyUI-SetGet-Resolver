# ComfyUI Set/Get Resolver

这是一个简单的辅助插件，仅用于将 `KJNodes` 的 **Set Node** 和 **Get Node** 逻辑连接转换为真实的物理连线。


### 功能
在 ComfyUI 画布空白处点击**右键**，选择 **"⚡ Replace Set/Get with Wires"**。

脚本会：
1. 查找所有配对的 Set/Get 节点。
2. 将 Set 的上游直接连到 Get 的下游。
3. 询问是否删除原本的 Set/Get 节点。
   

### 适用场景

在拆解工作流的时候，使用了Set Node节点和Get Node节点过多，导致不知道实线是怎么连接的，通过这个插件可以快速改成实线。

使用Set Node和Get Node的情况如下图
<img width="2197" height="837" alt="1111" src="https://github.com/user-attachments/assets/54f01209-1fc9-469e-b321-9763413ab6e9" />




在空白地方右键，点击“⚡ Replace Set/Get with Wires”按钮
<img width="952" height="680" alt="22222" src="https://github.com/user-attachments/assets/fac2b387-66de-40b0-a052-5c13bdfbeedb" />




会弹框进行询问，“取消”则取消次操作。
<img width="1214" height="626" alt="33333" src="https://github.com/user-attachments/assets/69e37c65-4e7c-4a92-a3fb-e00cca947b47" />




“Wire Only”则连接物理连线，但不会删除Set Node节点和Get Node节点
<img width="1320" height="778" alt="444444" src="https://github.com/user-attachments/assets/89f9508d-7f0d-4ec4-8996-b288f7955ccf" />




“Wire & Delete”则会连接物理连线并删除Set Node节点和Get Node节点
<img width="1351" height="845" alt="55555555" src="https://github.com/user-attachments/assets/5987a32b-5a50-4946-9bdf-f2c3832b63a5" />
