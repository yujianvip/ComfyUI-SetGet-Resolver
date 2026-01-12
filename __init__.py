import os

# 映射 web 目录，让 ComfyUI 加载 js 文件夹里的脚本
WEB_DIRECTORY = "./js"

# 这是一个纯前端辅助插件，不需要 Python 节点类
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]

print("\033[34m[ComfyUI-SetGet-Resolver] \033[0mLoaded. Right-click on canvas to use.")