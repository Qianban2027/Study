#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json

# 需要跳过的目录或文件，可根据需求自行增删
EXCLUDE_DIRS = {'.git', '.github', 'docs', '__pycache__'}
EXCLUDE_FILES = {'readme.md', 'LICENSE', '.gitignore', 'git_sync.bat', 'git_sync.sh'}

def scan_directory(base_path, current_path=""):
    """
    递归扫描 base_path 下的文件和目录，返回树状结构的列表。
    :param base_path: 要扫描的实际操作系统路径
    :param current_path: 从仓库根目录开始的相对路径，用于前端显示或下载
    :return: 一个列表，每个元素是 {name, type, path, children?}
    """
    entries = []
    try:
        for entry in os.scandir(base_path):
            if entry.is_dir():
                # 如果是需要排除的目录，直接跳过
                if entry.name in EXCLUDE_DIRS:
                    continue

                entries.append({
                    "name": entry.name,
                    "type": "directory",
                    "path": os.path.join(current_path, entry.name).replace("\\", "/"),
                    "children": scan_directory(
                        os.path.join(base_path, entry.name),
                        os.path.join(current_path, entry.name)
                    )
                })
            else:
                # 如果是需要排除的文件，直接跳过
                if entry.name in EXCLUDE_FILES:
                    continue

                entries.append({
                    "name": entry.name,
                    "type": "file",
                    "path": os.path.join(current_path, entry.name).replace("\\", "/")
                })
    except PermissionError:
        # 如果没有权限读取某些目录，就跳过
        pass

    return entries

def main():
    # 仓库根目录（此脚本位于 docs/ 下，往上一层就是仓库根目录）
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data = scan_directory(repo_root)

    # 将扫描结果写入 docs/files.json
    json_path = os.path.join(repo_root, "docs", "files.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"已生成文件树 JSON => {json_path}")

if __name__ == "__main__":
    main()
