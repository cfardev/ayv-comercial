const canvasHost = document.querySelector("#canvas");
const list = document.querySelector("#process-list");
const stage = document.querySelector("#stage");
const statusEl = document.querySelector("#status");
const viewer = new BpmnJS({ container: canvasHost });

function setStatus(message) {
	statusEl.textContent = message;
}

function markCurrent(code) {
	for (const button of list.querySelectorAll("button")) {
		if (button.dataset.code === code) {
			button.setAttribute("aria-current", "true");
		} else {
			button.removeAttribute("aria-current");
		}
	}
}

async function show(process) {
	history.replaceState(null, "", `#${process.code}`);
	markCurrent(process.code);
	setStatus("Cargando…");
	const response = await fetch(process.file);
	if (!response.ok) {
		setStatus("No se pudo cargar el diagrama.");
		return;
	}
	try {
		await viewer.importXML(await response.text());
		viewer.get("canvas").zoom("fit-viewport");
		setStatus("");
	} catch (error) {
		setStatus("No se pudo dibujar el diagrama.");
		console.error(error);
	}
}

function slug(title) {
	return title
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

async function downloadPng(process) {
	const { svg } = await viewer.saveSVG();
	const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
	const root = parsed.documentElement;
	const viewBox = (root.getAttribute("viewBox") || "")
		.split(/[\s,]+/)
		.map(Number);
	const width = Number(root.getAttribute("width")) || viewBox[2] || 1600;
	const height = Number(root.getAttribute("height")) || viewBox[3] || 900;
	root.setAttribute("width", String(width));
	root.setAttribute("height", String(height));
	const blob = new Blob([new XMLSerializer().serializeToString(root)], {
		type: "image/svg+xml;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const image = new Image();
	image.onload = () => {
		const scale = 2;
		const canvas = document.createElement("canvas");
		canvas.width = Math.ceil(width * scale);
		canvas.height = Math.ceil(height * scale);
		const context = canvas.getContext("2d");
		context.fillStyle = "#ffffff";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		canvas.toBlob((png) => {
			if (!png) return;
			const link = document.createElement("a");
			link.href = URL.createObjectURL(png);
			link.download = `${process.code}-${slug(process.title)}.png`;
			link.click();
			URL.revokeObjectURL(link.href);
		}, "image/png");
		URL.revokeObjectURL(url);
	};
	image.src = url;
}

document.querySelector("#zoom-in").addEventListener("click", () => {
	viewer.get("zoomScroll").stepZoom(1);
});
document.querySelector("#zoom-out").addEventListener("click", () => {
	viewer.get("zoomScroll").stepZoom(-1);
});
document.querySelector("#fit").addEventListener("click", () => {
	viewer.get("canvas").zoom("fit-viewport");
});
document.querySelector("#fullscreen").addEventListener("click", () => {
	if (document.fullscreenElement) {
		document.exitFullscreen();
		return;
	}
	stage.requestFullscreen();
});
document.addEventListener("fullscreenchange", () => {
	const canvas = viewer.get("canvas");
	canvas.resized();
	canvas.zoom("fit-viewport");
});

let current = PROCESSES[0];
document.querySelector("#download").addEventListener("click", () => {
	downloadPng(current);
});

for (const process of PROCESSES) {
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.code = process.code;
	button.innerHTML = `<span class="code">${process.code}</span><span>${process.title}</span>`;
	button.addEventListener("click", () => {
		current = process;
		show(process);
	});
	list.append(button);
}

current =
	PROCESSES.find((process) => process.code === location.hash.slice(1)) ??
	PROCESSES[0];
show(current);
