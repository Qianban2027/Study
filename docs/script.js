// script.js

// GitHub Raw 文件前缀，根据你的仓库地址和分支名进行调整
const GITHUB_RAW_PREFIX = "https://raw.githubusercontent.com/Qianban2027/Study/main/";

// 全局变量保存原始数据
let originalData = [];
let currentData = [];

// 读取 /docs/files.json 文件
fetch("files.json")
  .then((response) => response.json())
  .then((data) => {
    originalData = data; // 保存原始数据
    currentData = data; // 初始化当前显示数据
    renderFileTree(data);
  })
  .catch((err) => {
    console.error("加载 JSON 文件出现错误:", err);
    document.getElementById("file-tree").innerHTML = "<p>无法加载文件列表。</p>";
  });

// 监听搜索框输入
document.getElementById("searchInput").addEventListener("input", function() {
  const query = this.value.trim().toLowerCase();
  applyFilters(query, document.getElementById("sortSelect").value);
});

// 监听排序选项变化
document.getElementById("sortSelect").addEventListener("change", function() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  applyFilters(query, this.value);
});

// 监听多选下载按钮点击
document.getElementById("downloadSelected").addEventListener("click", function() {
  const selectedLinks = document.querySelectorAll(".select-checkbox:checked + .download-link");
  if (selectedLinks.length === 0) {
    alert("请先选择要下载的文件。");
    return;
  }
  
  selectedLinks.forEach(link => {
    // 创建一个临时的 <a> 元素用于触发下载
    const a = document.createElement('a');
    a.href = link.href;
    a.download = link.download;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

// 应用搜索和排序过滤
function applyFilters(query, sortOption) {
  let filteredData = [];

  if (query === "") {
    filteredData = originalData;
  } else {
    filteredData = filterTree(originalData, query);
  }

  if (sortOption) {
    filteredData = sortTree(filteredData, sortOption);
  }

  currentData = filteredData;
  renderFileTree(filteredData);
}

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

// 递归排序树，根据排序选项
function sortTree(data, sortOption) {
  const [key, order] = sortOption.split('-');

  const sortedData = [...data].sort((a, b) => {
    let aKey = a[key];
    let bKey = b[key];

    // 如果排序键是 type，确保 directory 排在前面
    if (key === "type") {
      aKey = a.type === "directory" ? "a" : "b";
      bKey = b.type === "directory" ? "a" : "b";
    }

    if (aKey < bKey) return order === "asc" ? -1 : 1;
    if (aKey > bKey) return order === "asc" ? 1 : -1;
    return 0;
  });

  // 递归排序子节点
  sortedData.forEach(item => {
    if (item.type === "directory" && item.children && item.children.length > 0) {
      item.children = sortTree(item.children, sortOption);
    }
  });

  return sortedData;
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

  // 初始化所有文件夹的点击事件
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
    // 使用 Font Awesome 的 chevron-right 图标
    toggleSpan.innerHTML = '<i class="fas fa-chevron-right"></i>';
    li.appendChild(toggleSpan);

    // 文件夹名称
    const nameSpan = document.createElement("span");
    nameSpan.className = "folder-icon";
    nameSpan.innerHTML = highlightText(item.name);
    nameSpan.title = item.name; // 添加工具提示
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
    // 多选框
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "select-checkbox";
    // 阻止点击复选框时触发父级事件
    checkbox.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    li.appendChild(checkbox);

    // 文件名称
    const nameSpan = document.createElement("span");
    nameSpan.className = "file-icon";
    nameSpan.innerHTML = highlightText(item.name);
    nameSpan.title = item.name; // 添加工具提示
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

// 获取文件扩展名
function getFileExtension(filename) {
  return filename.split('.').pop();
}

// 绑定折叠/展开事件
function addToggleClickEvent() {
  const folderItems = document.querySelectorAll("li.folder-item");

  folderItems.forEach(folder => {
    folder.addEventListener("click", function(e) {
      // 切换 open 类
      this.classList.toggle("open");
    });
  });
}

// 高亮搜索关键词
function highlightText(text) {
  const searchQuery = document.getElementById("searchInput").value.trim();
  if (searchQuery === "") return escapeHTML(text);

  const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
  return escapeHTML(text).replace(regex, '<span class="highlight">$1</span>');
}

// 转义HTML特殊字符
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// 转义正则表达式中的特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}