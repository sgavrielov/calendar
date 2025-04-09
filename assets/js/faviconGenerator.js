const canvas = document.createElement("canvas");
canvas.width = 64;
canvas.height = 64;
const ctx = canvas.getContext("2d");
ctx.font = "48px serif";
ctx.fillText("📅", 8, 48);

const link = document.createElement("link");
link.rel = "icon";
link.type = "image/png";
link.href = canvas.toDataURL();
document.head.appendChild(link);
