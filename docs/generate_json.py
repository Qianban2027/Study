import os
import json

def generate_files_json(output_file="docs/files.json"):
    # 遍历所有文件和目录
    files_data = []
    for root, dirs, files in os.walk("."):
        for file in files:
            file_path = os.path.relpath(os.path.join(root, file), ".")
            files_data.append({
                "name": file,
                "type": "file",
                "path": file_path
            })

    # 将文件信息写入 JSON 文件（格式化为多行）
    with open(output_file, "w") as json_file:
        json.dump(files_data, json_file, indent=4)

    print(f"{output_file} updated successfully.")

if __name__ == "__main__":
    generate_files_json()
