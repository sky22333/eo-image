export function onRequestGet(context) {
  const imagesMap = {"fox":["fox/001.png","fox/002.png","fox/003.png"],"furina":["furina/mmexport1746786751720.webp","furina/mmexport1746786759112.webp","furina/mmexport1746786767584.webp"],"girl":["girl/1620171137327.webp","girl/1623904139568.webp","girl/1623905002587.webp"],"mobi":["mobi/2000PXA%E5%A3%81%E7%BA%B81.webp","mobi/2000PXA%E5%A3%81%E7%BA%B82.webp","mobi/2000PXA%E5%A3%81%E7%BA%B83.webp"],"moe":["moe/66505f8e72fb4.webp","moe/66505f8eb5f12.webp","moe/66505f91b1fbf.webp"],"pc":["pc/cp.webp","pc/cp1.webp","pc/cp3.webp"],"pm":["pm/005.webp","pm/016.webp","pm/021.webp"],"wife":["wife/Arcaea-%E5%85%89.jpg","wife/Ringo-chan.jpg","wife/%E9%98%BF%E7%BA%B3%E6%96%AF%E5%A1%94%E8%A5%BF%E4%BA%9A.png"]};
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
    ? "/images/" + list[Math.floor(Math.random() * list.length)]
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