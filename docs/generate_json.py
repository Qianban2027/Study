import os
import json

# 定义忽略的文件和目录
IGNORE_FILES = ["git_sync.sh", "git_sync.bat", "LICENSE"]
IGNORE_DIRS = [".git", ".github"]

def generate_file_structure(base_path, relative_path=""):
    file_list = []
    full_path = os.path.join(base_path, relative_path)
    
    for item in os.listdir(full_path):
        # 跳过忽略的文件和目录
        if item in IGNORE_FILES or item in IGNORE_DIRS:
            continue
        
        item_path = os.path.join(full_path, item)
        relative_item_path = os.path.join(relative_path, item)
        
        if os.path.isdir(item_path):  # 如果是目录
            file_list.append({
                "name": item,
                "type": "directory",
                "path": relative_item_path,
                "children": generate_file_structure(base_path, relative_item_path)
            })
        else:  # 如果是文件
            file_list.append({
                "name": item,
                "type": "file",
                "path": relative_item_path
            })
    
    return file_list

# 生成文件结构
base_directory = "docs"
file_structure = generate_file_structure(base_directory)

# 保存为 JSON 文件
output_file = os.path.join(base_directory, "files.json")
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(file_structure, f, indent=2, ensure_ascii=False)

print(f"JSON 文件已生成：{output_file}")
