const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "images");
const apiDir = path.join(__dirname, "functions", "api");
const apiFilePath = path.join(apiDir, "[[path]].js");
const apiTemplatePath = path.join(__dirname, "functions", "api_template.js");
const imagesIndexHtmlPath = path.join(rootDir, "index.html");
const homeIndexHtmlPath = path.join(__dirname, "index.html");

// 1. 扫描分类
const categories = fs.readdirSync(rootDir).filter(file => {
  return fs.statSync(path.join(rootDir, file)).isDirectory();
});

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

// 2. 收集图片
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
      results.push(encodeURI(relativePath));
    }
  });
  return results;
};

const imagesMap = {};
categories.forEach((category) => {
  imagesMap[category] = walkDir(path.join(rootDir, category));
});

// 3. 生成 API
if (fs.existsSync(apiTemplatePath)) {
    let templateContent = fs.readFileSync(apiTemplatePath, "utf-8");
    const replacement = `const imagesMap = ${JSON.stringify(imagesMap)};`;
    
    const apiContent = templateContent.replace("// __IMAGES_MAP_PLACEHOLDER__", replacement);
    
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(apiFilePath, apiContent);
    console.log(`✅ API: ${apiFilePath}`);
} else {
    console.error("❌ 错误: 缺少 api_template.js");
    process.exit(1);
}

// 4. 生成图片索引页
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

fs.writeFileSync(imagesIndexHtmlPath, html);
console.log("✅ 索引页: images/index.html");

// 5. 更新主页
if (fs.existsSync(homeIndexHtmlPath)) {
    let homeHtml = fs.readFileSync(homeIndexHtmlPath, "utf-8");
    
    const tagsHtml = categories.map(cat => 
        `                    <a href="./api/${cat}" class="category-tag">${cat}</a>`
    ).join("\n");
    
    const newCategoryListHtml = `<div class="category-list">\n${tagsHtml}\n                </div>`;
    
    const regex = /<div class="category-list">[\s\S]*?<\/div>/;
    
    if (regex.test(homeHtml)) {
        homeHtml = homeHtml.replace(regex, newCategoryListHtml);
        fs.writeFileSync(homeIndexHtmlPath, homeHtml);
        console.log("✅ 主页: index.html");
    } else {
        console.warn("⚠️ 主页更新跳过: 未找到 .category-list");
    }
} else {
    console.warn("⚠️ 主页更新跳过: 未找到 index.html");
}
