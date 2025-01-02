// script.js

// GitHub Raw 文件前缀，根据你的仓库地址和分支名进行调整
const GITHUB_RAW_PREFIX = "https://raw.githubusercontent.com/Qianban2027/Study/main/";

// 全局变量保存原始数据
let originalData = [];

// 读取 /docs/files.json 文件
fetch("files.json")
  .then((response) => response.json())
  .then((data) => {
    originalData = data; // 保存原始数据
    renderFileTree(data);
  })
  .catch((err) => {
    console.error("加载 JSON 文件出现错误:", err);
    document.getElementById("file-tree").innerHTML = "<p>无法加载文件列表。</p>";
  });

// 监听搜索框输入
document.getElementById("searchInput").addEventListener("input", function() {
  const query = this.value.trim().toLowerCase();
  if (query === "") {
    renderFileTree(originalData);
  } else {
    const filteredData = filterTree(originalData, query);
    renderFileTree(filteredData);
  }
});

// 递归过滤树，根据查询关键词
function filterTree(data, query) {
  const filtered = [];

  data.forEach(item => {
    if (item.type === "directory") {
      const filteredChildren = filterTree(item.children || [], query);
      if (filteredChildren.length > 0 || item.name.toLowerCase().includes(query)) {
        filtered.push({
          ...item,
          children: filteredChildren
        });
      }
    } else {
      if (item.name.toLowerCase().includes(query)) {
        filtered.push(item);
      }
    }
  });

  return filtered;
}

// 渲染文件树
function renderFileTree(data) {
  const fileTreeContainer = document.getElementById("file-tree");
  fileTreeContainer.innerHTML = ""; // 清空之前的内容

  if (data.length === 0) {
    fileTreeContainer.innerHTML = "<p>未找到匹配的文件或文件夹。</p>";
    return;
  }

  const ul = document.createElement("ul");

  data.forEach(item => {
    const li = createTreeItem(item);
    ul.appendChild(li);
  });

  fileTreeContainer.appendChild(ul);

  // 绑定折叠/展开事件
  addToggleClickEvent();
}

// 创建树节点（文件夹/文件）
function createTreeItem(item) {
  const li = document.createElement("li");
  li.classList.add(item.type === "directory" ? "folder-item" : "file-item");

  if (item.type === "directory") {
    // 折叠/展开按钮
    const toggleSpan = document.createElement("span");
    toggleSpan.className = "toggle-btn";
    li.appendChild(toggleSpan);

    // 文件夹名称
    const nameSpan = document.createElement("span");
    nameSpan.className = "folder-icon";
    nameSpan.textContent = highlightText(item.name);
    li.appendChild(nameSpan);

    // 递归创建子节点
    if (item.children && item.children.length > 0) {
      const subUl = document.createElement("ul");
      subUl.className = "nested";
      item.children.forEach(child => {
        const childLi = createTreeItem(child);
        subUl.appendChild(childLi);
      });
      li.appendChild(subUl);
    }
  } else {
    // 文件名称
    const nameSpan = document.createElement("span");
    nameSpan.className = "file-icon";
    nameSpan.textContent = highlightText(item.name);
    li.appendChild(nameSpan);

    // 下载链接
    const link = document.createElement("a");
    link.className = "download-link";
    link.textContent = "[下载]";
    let pathWithoutSlash = item.path.replace(/^\/+/, '');
    link.href = GITHUB_RAW_PREFIX + pathWithoutSlash;
    link.download = item.name; // 提示下载
    link.target = "_blank"; // 在新标签页打开
    li.appendChild(link);
  }

  return li;
}

// 绑定折叠/展开事件
function addToggleClickEvent() {
  const folderItems = document.querySelectorAll("li.folder-item");

  folderItems.forEach(folder => {
    folder.addEventListener("click", function(e) {
      // 防止事件冒泡到父级
      e.stopPropagation();

      // 切换 open 类
      this.classList.toggle("open");
    });
  });
}

// 高亮搜索关键词
function highlightText(text) {
  const searchQuery = document.getElementById("searchInput").value.trim();
  if (searchQuery === "") return text;

  const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

// 转义正则表达式中的特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}