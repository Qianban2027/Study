import os
import json

def build_file_tree(base_path, rel_path=""):
    file_tree = []
    full_path = os.path.join(base_path, rel_path)
    for entry in os.listdir(full_path):
        entry_path = os.path.join(full_path, entry)
        if os.path.isfile(entry_path):
            file_tree.append({"name": entry, "type": "file", "path": os.path.join(rel_path, entry)})
        elif os.path.isdir(entry_path):
            file_tree.append({
                "name": entry,
                "type": "directory",
                "path": os.path.join(rel_path, entry),
                "children": build_file_tree(base_path, os.path.join(rel_path, entry))
            })
    return file_tree

def main():
    base_path = "."  # 根目录
    file_tree = build_file_tree(base_path)
    output_path = "docs/files.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(file_tree, f, ensure_ascii=False, indent=4)
    print(f"JSON 文件已生成: {output_path}")

if __name__ == "__main__":
    main()
