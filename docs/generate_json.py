import os
import json

def generate_file_tree(base_path, relative_path=""):
    items = []
    full_path = os.path.join(base_path, relative_path)
    for item in sorted(os.listdir(full_path)):
        # 跳过指定文件
        if item in ["git_sync.sh", "git_sync.bat", "LICENSE"]:
            continue
        item_path = os.path.join(full_path, item)
        if os.path.isdir(item_path):
            # 如果是目录，递归生成
            items.append({
                "name": item,
                "type": "directory",
                "path": os.path.join(relative_path, item).replace("\\", "/"),
                "children": generate_file_tree(base_path, os.path.join(relative_path, item))
            })
        else:
            # 如果是文件，直接添加
            items.append({
                "name": item,
                "type": "file",
                "path": os.path.join(relative_path, item).replace("\\", "/")
            })
    return items

if __name__ == "__main__":
    base_path = "."  # 根目录
    # 确保 docs 目录存在
    if not os.path.exists("docs"):
        os.makedirs("docs")

    file_tree = generate_file_tree(base_path)
    # 写入 JSON 文件
    with open("docs/files.json", "w", encoding="utf-8") as f:
        json.dump({"files": file_tree}, f, indent=4, ensure_ascii=False)
    print("JSON file generated at docs/files.json")
