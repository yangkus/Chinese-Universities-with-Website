# 中国高校网站镜像

这是一个 Node.js 项目，用于获取远程 URL 中的数据，解析并提取中国高校及其对应的官网 URL，数据将以 JSON 格式保存。

## 数据

[chinese_universities_with_website.json](./chinese_universities_with_website.json)

## 使用

### 前提条件

- Node.js（v14 或以上版本）
- npm（Node 包管理器）

### 安装运行

1. 将此存储库克隆到您的本地计算机。
2. 在项目目录中运行以下命令以安装所需的依赖项：

```bash
npm install
```

3. 要运行项目并从远程 URL 中获取数据，请使用以下命令：

```bash
npm start
```

1. 该项目将获取数据，解析并在相同目录下创建名为 `chinese_universities_with_website.json` 的 JSON 文件。
2. 修改：添加主页镜像功能，存放文件夹` ./mirrored_pages`
3. 修改：镜像失败加入候补队列，重试次数`retries=1`
4. 修改：报错日志文件`./error.log`
5. todo：二级镜像还没做

## 输出

JSON 文件的数据格式如下：

```json
{
  "城市1": {
    "大学1": "https://university1.com",
    "大学2": "https://university2.com"
    // 根据数据，添加城市1的更多大学
  },
  "城市2": {
    "大学3": "https://university3.com",
    "大学4": "https://university4.com"
    // 根据数据，添加城市2的更多大学
  }
  // 根据数据，添加更多城市和大学
}
```
html文件的数据格式如下：
```
学校1.html
学院2.html
```
## 许可证

本项目基于 MIT 许可证授权。有关详情，请查阅 [LICENSE](LICENSE) 文件。

## 致谢
* 本项目基于(https://github.com/lcandy2/Chinese-Universities-with-Website)进行修改。
* 本项目数据来自 [DiamonWoo/Laosheng.top](https://github.com/DiamonWoo/Laosheng.top) 的 [yuanxiao.md](https://github.com/DiamonWoo/Laosheng.top/blob/master/fuwu/yuanxiao.md) 文件。
* 本项目使用 [cheerio](https://github.com/cheeriojs/cheerio) 库进行 HTML 内容解析。

## 作者

- [江城Anthony52233](http://weixin.qq.com/r/Anthony52233")
- [lcandy2](https://github.com/lcandy2)



