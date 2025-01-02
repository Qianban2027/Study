import os
import json
from datetime import datetime

# 忽略的文件夹和文件类型
IGNORED_FOLDERS = ['.git', '__pycache__']
IGNORED_EXTENSIONS = ['.tmp', '.log']

def generate_file_structure(folder_path):
    structure = []
    for entry in os.scandir(folder_path):
        if entry.is_dir() and entry.name in IGNORED_FOLDERS:
            continue
        if entry.is_file() and any(entry.name.endswith(ext) for ext in IGNORED_EXTENSIONS):
            continue

        if entry.is_dir():
            structure.append({
                "name": entry.name,
                "type": "folder",
                "children": generate_file_structure(entry.path)
            })
        else:
            structure.append({
                "name": entry.name,
                "type": "file",
                "path": os.path.relpath(entry.path, start=folder_path).replace("\\", "/")
            })
    return structure

if __name__ == "__main__":
    root_directory = "./docs"
    output_file = "docs/files.json"

    file_structure = generate_file_structure(root_directory)

    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(file_structure, json_file, separators=(",", ":"), ensure_ascii=False)

    print(f"files.json updated successfully at {output_file}")
