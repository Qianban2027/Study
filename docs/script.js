document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("file-tree");
    const loader = document.getElementById("loader");

    loader.style.display = "block";

    fetch("files.json") // 注意路径
        .then((response) => response.json())
        .then((data) => {
            loader.style.display = "none";
            renderTree(container, data.files);
        })
        .catch((error) => {
            loader.textContent = "Failed to load file tree.";
            console.error("Error loading file tree:", error);
        });
});

function renderTree(container, files) {
    container.innerHTML = "";
    const ul = document.createElement("ul");

    files.forEach((file) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.textContent = file.name;

        if (file.type === "directory") {
            name.classList.add("directory");
            li.appendChild(name);

            const childrenContainer = document.createElement("ul");
            childrenContainer.style.display = "none";
            li.appendChild(childrenContainer);

            name.addEventListener("click", () => {
                if (childrenContainer.childElementCount === 0) {
                    renderTree(childrenContainer, file.children);
                }
                childrenContainer.style.display =
                    childrenContainer.style.display === "none" ? "block" : "none";
            });
        } else {
            name.classList.add("file");
            li.appendChild(name);
        }
        ul.appendChild(li);
    });

    container.appendChild(ul);
}
