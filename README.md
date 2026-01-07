## EdgeOne Pages 随机图床

1：前往[腾讯云Pages](https://console.cloud.tencent.com/edgeone/pages)

2：点击`创建项目`，导入Git仓库

3：构建设置

4：构建命令填`npm run build`，其余默认

5：点击`开始部署`

#### 使用说明

在`images`目录下新建文件夹，文件夹名称即为分类名称，然后添加图片。

每次增删图片或者分类后， 必须运行`npm run build`构建脚本来更新 API 逻辑和索引页面。