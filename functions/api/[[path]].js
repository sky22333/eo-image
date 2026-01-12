export function onRequestGet(context) {
  const imagesMap = {"girl":["girl/1620171137327.webp","girl/1623904139568.webp","girl/1623905002587.webp"],"mobi":["mobi/2000PXA%E5%A3%81%E7%BA%B81.webp","mobi/2000PXA%E5%A3%81%E7%BA%B82.webp","mobi/2000PXA%E5%A3%81%E7%BA%B83.webp"],"pc":["pc/cp.webp","pc/cp1.webp","pc/cp3.webp"]};
  
  let category = null;

  if (context.params && context.params.path) {
    const pathParams = Array.isArray(context.params.path) ? context.params.path : [context.params.path];
    category = pathParams[0];
  }

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
    ? "/images/" + list[Math.floor(Math.random() * list.length)]
    : null;

  if (!url) {
    return new Response("No images found", { status: 404 });
  }

  // 302 重定向，显式禁止缓存
  return new Response("", {
    status: 302,
    headers: {
      "Location": url,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
