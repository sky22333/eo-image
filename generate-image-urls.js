const fs = require("fs");
const path = require("path");

const imageBaseUrl = "/images";
const rootDir = path.join(__dirname, "images");
const apiDir = path.join(__dirname, "functions", "api");
const apiFilePath = path.join(apiDir, "[[path]].js");
const indexHtmlPath = path.join(rootDir, "index.html");

// 自动扫描分类
const categories = fs.readdirSync(rootDir).filter(file => {
  return fs.statSync(path.join(rootDir, file)).isDirectory();
});

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

// 递归收集图片
const walkDir = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results.push(...walkDir(filePath));
    } else if (isImage(file)) {
      const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
      // 在构建时进行 URL 编码
      results.push(encodeURI(relativePath));
    }
  });
  return results;
};

// 生成图片映射
const imagesMap = {};
categories.forEach((category) => {
  imagesMap[category] = walkDir(path.join(rootDir, category));
});

// 生成 API
const apiJsContent = `
export function onRequestGet(context) {
  const imagesMap = ${JSON.stringify(imagesMap)};
  let category = null;

  // 获取分类
  if (context.params && context.params.path) {
    const pathParams = Array.isArray(context.params.path) ? context.params.path : [context.params.path];
    category = pathParams[0];
  }



  // 统一小写
  if (category) {
    category = category.toLowerCase();
  }

  let list = [];
  if (category && imagesMap[category]) {
    list = imagesMap[category];
  } else {
    // 默认：所有图片
    Object.values(imagesMap).forEach(arr => list.push(...arr));
  }

  const url = list.length > 0
    ? "${imageBaseUrl}/" + list[Math.floor(Math.random() * list.length)]
    : null;

  if (!url) {
    return new Response("No images found", { status: 404 });
  }

  // 禁止缓存
  return new Response("", {
    status: 302,
    headers: {
      "Location": url,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}
`.trim();

// 确保目录存在
fs.mkdirSync(apiDir, { recursive: true });

// 清理旧文件
if (fs.existsSync(path.join(__dirname, "functions", "api.js"))) {
  fs.unlinkSync(path.join(__dirname, "functions", "api.js"));
}

fs.writeFileSync(apiFilePath, apiJsContent);
console.log(`✅ 生成 API 成功: ${apiFilePath}`);

// 生成 HTML 索引
let html = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>随机图片 API 索引</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; color: #333; }
    h1 { text-align: center; color: #444; }
    .category-section { margin-bottom: 3rem; }
    .category-title { font-size: 1.5rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #ddd; text-transform: capitalize; }
    ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; list-style: none; padding: 0; }
    li { background: white; padding: 0.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; }
    a { display: block; text-decoration: none; color: inherit; }
    img { width: 100%; height: 120px; object-fit: cover; border-radius: 4px; display: block; margin-bottom: 0.5rem; }
    .filename { font-size: 0.8rem; word-break: break-all; color: #666; }
    footer { text-align: center; margin-top: 4rem; color: #999; }
  </style>
</head>
<body>
  <h1>图片索引</h1>
`;

categories.forEach(category => {
    const images = imagesMap[category];
    if (images.length > 0) {
      html += `<div class="category-section">
        <div class="category-title">${category} (${images.length})</div>
        <ul>`;
      images.forEach(img => {
        html += `<li>
          <a href="${img}" target="_blank">
            <img src="${img}" loading="lazy" alt="${decodeURI(img)}">
            <span class="filename">${decodeURI(path.basename(img))}</span>
          </a>
        </li>`;
      });
      html += `</ul></div>`;
    }
  });

html += `
</body>
</html>`;

fs.writeFileSync(indexHtmlPath, html);
console.log("✅ 生成 HTML 成功");
