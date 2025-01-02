/**
 * 1. 请求 docs/files.json
 * 2. 将结果进行排序（目录在上、文件在下，并按名称排序）
 * 3. 递归生成 DOM 结构
 * 4. 支持点击目录展开/收起
 * 5. 对于文件，提供下载链接
 */

// 入口函数
document.addEventListener("DOMContentLoaded", () => {
  fetch("files.json")
    .then((response) => response.json())
    .then((data) => {
      // 隐藏 loader
      document.getElementById("loader").style.display = "none";
      // 显示 file-tree 容器
      const fileTreeContainer = document.getElementById("file-tree");
      fileTreeContainer.style.display = "block";

      // 创建并渲染整个树
      const ul = document.createElement("ul");
      fileTreeContainer.appendChild(ul);
      renderTree(sortEntries(data), ul);
    })
    .catch((error) => {
      console.error("加载 files.json 出错：", error);
      document.getElementById("loader").textContent = "Error loading files.json";
    });
});

/**
 * 对同一层的节点先区分目录和文件，然后分别按名称排序，最后合并。
 */
function sortEntries(entries) {
  const dirs = entries.filter((e) => e.type === "directory");
  const files = entries.filter((e) => e.type === "file");

  // 按名称排序
  dirs.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));
  files.sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN", { numeric: true }));

  return [...dirs, ...files];
}

/**
 * 递归渲染文件树。
 * @param {Array} data - 当前层级的节点
 * @param {HTMLElement} container - 父节点的容器 (ul)
 */
function renderTree(data, container) {
  data.forEach((item) => {
    const li = document.createElement("li");
    container.appendChild(li);

    if (item.type === "directory") {
      // 目录
      li.classList.add("directory");
      li.textContent = item.name;

      // 点击目录时，展开/收起子目录
      li.addEventListener("click", (e) => {
        // 阻止事件向上冒泡，避免在子节点点击也触发
        e.stopPropagation();
        // 切换子 UL 的显示/隐藏
        if (li.children[0].tagName === "UL") {
          li.children[0].style.display =
            li.children[0].style.display === "none" ? "block" : "none";
        }
      });

      // 如果有 children，递归创建
      if (item.children && item.children.length > 0) {
        const subUl = document.createElement("ul");
        li.appendChild(subUl);
        renderTree(sortEntries(item.children), subUl);
        // 默认先显示，可以根据需要改成默认隐藏
      }
    } else if (item.type === "file") {
      // 文件
      li.classList.add("file");

      // 用一个 <a> 来做下载链接
      const link = document.createElement("a");
      link.textContent = item.name;
      // 假设直接用相对路径作为下载链接，如果你用 GitHub Pages，需要根据实际情况调整
      link.href = `../${item.path}`;
      link.setAttribute("download", item.name);

      li.textContent = ""; // 清空 li 的文字
      li.appendChild(link);
    }
  });
}
