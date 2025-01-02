import os
import json

# 忽略的文件名
IGNORE_FILES = ["LICENSE", "git_sync.sh", "git_sync.bat"]

def list_files_in_directory(directory):
    result = []
    for root, dirs, files in os.walk(directory):
        relative_path = os.path.relpath(root, directory)
        for file in files:
            if file not in IGNORE_FILES:
                result.append({
                    "name": file,
                    "type": "file",
                    "path": os.path.join(relative_path, file)
                })
    return result

directory = "docs"
files = list_files_in_directory(directory)
with open("docs/files.json", "w", encoding="utf-8") as f:
    json.dump(files, f, indent=2, ensure_ascii=False)
