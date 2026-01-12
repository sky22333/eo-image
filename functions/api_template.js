export function onRequestGet(context) {
  // __IMAGES_MAP_PLACEHOLDER__
  
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
