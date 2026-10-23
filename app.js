const objects = window.MANESSO_SOURCE_OBJECTS;
const tree = window.MANESSO_SOURCE_TREE;

const fileTree = document.querySelector("#fileTree");
let currentPath = "programs/manesso/src/lib.rs";

function fileKind(path) {
  const extension = path.split(".").pop().toUpperCase();
  return extension === "MD" ? "DOC" : extension;
}

function createRow(label, path, type, depth) {
  const row = document.createElement("button");
  row.className = "tree-row";
  row.dataset.depth = depth;
  row.dataset.type = type;
  row.dataset.path = path || "";
  row.innerHTML = '<span class="chev">' + (type === "folder" ? ">" : "") +
    '</span><span class="file-icon">' + (type === "folder" ? "[]" : "::") +
    '</span><span class="file-name">' + label + '</span><span class="file-kind">' +
    (type === "folder" ? "DIR" : fileKind(path)) + '</span>';
  return row;
}

tree.forEach((entry) => {
  if (entry.type === "folder") {
    const folder = createRow(entry.name, entry.name, "folder", 0);
    folder.classList.add("open");
    fileTree.appendChild(folder);
    entry.children.forEach((path) => {
      const file = createRow(path.split("/").pop(), path, "file", 1);
      file.dataset.parent = entry.name;
      file.onclick = () => openObject(path);
      fileTree.appendChild(file);
    });
    folder.onclick = () => {
      folder.classList.toggle("open");
      const open = folder.classList.contains("open");
      fileTree.querySelectorAll('[data-parent="' + entry.name + '"]')
        .forEach((row) => row.hidden = !open);
    };
  } else {
    const file = createRow(entry.name, entry.name, "file", 0);
    file.onclick = () => openObject(entry.name);
    fileTree.appendChild(file);
  }
});

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function highlight(line, language) {
  const trimmed = line.trim();
  let safe = escapeHtml(line);
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") ||
      trimmed.startsWith("* ") || trimmed.startsWith("Copyright:")) {
    return '<span class="comment">' + safe + '</span>';
  }
  if (trimmed.startsWith("#")) {
    return '<span class="heading">' + safe + '</span>';
  }
  if (language.includes("JSON")) {
    safe = safe.replace(/(&quot;[^&]*?&quot;)(?=\s*:)/g, '<span class="type">$1</span>');
    safe = safe.replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="string">$1</span>');
  }
  if (["RUST", "TYPESCRIPT", "JAVASCRIPT", "TEST"].includes(language)) {
    safe = safe.replace(/\b(pub|fn|struct|enum|impl|use|mod|let|mut|const|return|if|else|match|Self|true|false|import|from|export|async|await|throw|new|try|catch)\b/g, '<span class="keyword">$1</span>');
    safe = safe.replace(/\b(Pubkey|Account|Signer|Context|Result|u128|u64|u32|u16|i64|bool|String|Promise|void)\b/g, '<span class="type">$1</span>');
  }
  safe = safe.replace(/\b([0-9]+(?:\.[0-9]+)?)\b/g, '<span class="number">$1</span>');
  return safe || " ";
}

function openObject(path, symbol) {
  const object = objects[path];
  if (!object) return;
  currentPath = path;
  document.querySelector("#currentPath").textContent = path.replace("/", " / ");
  document.querySelector("#languageLabel").textContent = object.language;
  document.querySelector("#objectState").textContent = object.state;
  document.querySelector("#sourceSummary").textContent = object.description;
  const lines = object.content.split("\n");
  document.querySelector("#lineCount").textContent = lines.length + " LINES";
  document.querySelector("#codeView").innerHTML = lines.map((line, index) =>
    '<span class="code-line"><span class="num">' +
    String(index + 1).padStart(3, "0") +
    '</span>' + highlight(line, object.language) + '</span>'
  ).join("");
  document.querySelectorAll(".tree-row").forEach((row) =>
    row.classList.toggle("active", row.dataset.path === path)
  );
  document.querySelector("#loadState").textContent = "OBJECT VERIFIED / LOCAL";
  const matchLine = symbol ? lines.findIndex((line) => line.includes(symbol)) : -1;
  const codeScroll = document.querySelector("#codeScroll");
  const codeLines = codeScroll.querySelectorAll(".code-line");
  codeLines.forEach((line, index) => line.classList.toggle("symbol-focus", index === matchLine));
  codeScroll.scrollTop = matchLine >= 0 ? codeLines[matchLine].offsetTop - codeScroll.offsetTop - 90 : 0;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.querySelectorAll("[data-open]").forEach((button) => {
  button.onclick = () => {
    openObject(button.dataset.open, button.dataset.symbol);
    if (button.classList.contains("runtime-chip") || button.classList.contains("source-node")) {
      document.querySelector("#specification").scrollIntoView({ behavior: "smooth" });
    }
  };
});

const stageNames = ["MANIFEST", "REGISTRY", "POLICY", "RECEIPT", "SETTLEMENT", "GUARD"];
const stageNodes = [...document.querySelectorAll(".source-node")];
const backplaneStage = document.querySelector("#manessoBackplane");
const backplaneRead = document.querySelector("#backplaneRead");
const backplaneCounter = document.querySelector("#backplaneCounter");
let backplaneHandle = null;

if (backplaneStage) {
  backplaneStage.addEventListener("manesso-stage", (event) => {
    const index = event.detail;
    stageNodes.forEach((node, i) => node.classList.toggle("active", i === index));
    backplaneRead.textContent = index < 0 ? "SYSTEM READY" : stageNames[index];
    backplaneCounter.textContent = index < 0 ? "00 / 06" : String(index + 1).padStart(2, "0") + " / 06";
  });
  stageNodes.forEach((node, index) => {
    node.addEventListener("mouseenter", () => backplaneHandle?.select(index));
    node.addEventListener("focus", () => backplaneHandle?.select(index));
    node.addEventListener("mouseleave", () => backplaneHandle?.select(-1));
    node.addEventListener("blur", () => backplaneHandle?.select(-1));
  });
}

window.hairline = (figure) => {
  if (!backplaneStage || backplaneHandle) return;
  HL.inject(document);
  backplaneStage.dataset.hairline = figure.name;
  backplaneStage.setAttribute("role", "img");
  backplaneStage.setAttribute("aria-label", figure.means);
  const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, backplaneStage);
  const read = {
    get textContent() { return backplaneRead.textContent; },
    set textContent(value) { backplaneRead.textContent = String(value || "SYSTEM READY").toUpperCase(); }
  };
  backplaneHandle = figure.mount({ stage: backplaneStage, svg, read }, figure.range[1]);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sequence = [0, 2, 4, 5, -1];
    let step = 0;
    const cycle = setInterval(() => {
      if (!backplaneStage.matches(":hover") && !stageNodes.some((node) => node.matches(":focus-visible"))) {
        backplaneHandle.select(sequence[step++ % sequence.length]);
      }
    }, 2400);
    backplaneStage.addEventListener("pointerdown", () => clearInterval(cycle), { once: true });
  }
};

document.querySelector("#copyButton").onclick = async () => {
  await navigator.clipboard.writeText(objects[currentPath].content);
  showToast("OBJECT COPIED TO CLIPBOARD");
};

document.querySelector("#downloadButton").onclick = () => {
  const blob = new Blob([objects[currentPath].content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = currentPath.split("/").pop();
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("OBJECT DOWNLOAD STARTED");
};

openObject(currentPath);
