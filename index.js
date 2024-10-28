const https = require("https");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const url =
  "https://raw.githubusercontent.com/DiamonWoo/Laosheng.top/master/fuwu/yuanxiao.md";
const logFilePath = path.join(__dirname, "error.log");
const failedUniversities = []; // 候补队列

function make() {
  console.log("获取学校数据...");
  fetch(url)
    .then((content) => {
      console.log("获取学校数据成功：开始解析...");
      const jsonData = parse(content);
      write("chinese_universities_with_website.json", jsonData);

      // 爬取成功后处理候补队列
      if (failedUniversities.length > 0) {
        console.log("开始处理候补队列...");
        processFailedUniversities();
      }
    })
    .catch((error) => {
      console.error(error.message);
    });
}

function fetch(url, retries = 1) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { rejectUnauthorized: false, headers: { "User-Agent": "Mozilla/5.0" } },
        (res) => {
          if (res.statusCode !== 200) {
            reject(
              new Error(
                `Failed to fetch the content. Status code: ${res.statusCode}`
              )
            );
            return;
          }
          res.setEncoding("utf8");
          let rawData = "";
          res.on("data", (chunk) => {
            rawData += chunk;
          });
          res.on("end", () => {
            resolve(rawData);
          });
        }
      )
      .on("error", (error) => {
        if (retries > 0) {
          console.log(`重试中... 剩余尝试次数: ${retries}`);
          fetch(url, retries - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(
            new Error(`Error while fetching the content: ${error.message}`)
          );
        }
      });
  });
}

function parse(data) {
  const $ = cheerio.load(data);
  const result = {};

  $("h3").each((index, element) => {
    const cityName = $(element)
      .contents()
      .filter(function () {
        return this.nodeType === 3; // 过滤文本节点
      })
      .text()
      .trim();

    if ($(element).find("small").length === 0) {
      return true; // 如果没有 <small> 元素，继续下一次循环
    }

    const universities = {};
    $(element)
      .nextUntil("h3", "a")
      .each((i, aElement) => {
        parseUniv(aElement, universities, $);
      });

    $(element)
      .nextUntil("h3", "small")
      .find("a")
      .each((i, aElement) => {
        parseUniv(aElement, universities, $);
      });

    result[cityName] = universities;
  });

  console.log("解析学校数据成功：准备写入文件...");
  return result;
}

function parseUniv(aElement, universities, $) {
  const siblings = $(aElement).parent().contents();
  const aIndex = siblings.index(aElement);
  const preText = $(siblings[aIndex - 1])
    .text()
    .trim()
    .split(/\s/)
    .pop();
  let universityName = $(aElement).text();
  const validEndings = ["校", "院", "学"];

  if (validEndings.some((ending) => preText.endsWith(ending))) {
    universityName = preText + universityName;
  }

  let universityURL = $(aElement).attr("href");
  if (universityURL && universityURL.startsWith("#")) {
    return; // 如果链接以 "#" 开头，跳过
  }

  if (universityURL) {
    const parsedURL = new URL(universityURL);
    if (parsedURL.protocol === "http:") {
      parsedURL.protocol = "https:";
      universityURL = parsedURL.href;
    } else if (parsedURL.protocol !== "https:") {
      logError(
        `无法镜像 ${universityName} 的主页: Protocol "${parsedURL.protocol}" not supported.`
      );
      return;
    }
  }

  universities[universityName] = universityURL;

  mirrorUniversityHomePage(universityURL, universityName);
}

function mirrorUniversityHomePage(url, name) {
  fetch(url)
    .then((content) => {
      const filePath = path.join(__dirname, "mirrored_pages", `${name}.html`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFile(filePath, content, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file for ${name}:`, err);
        } else {
          console.log(`成功镜像 ${name} 的主页到 ${filePath}`);
        }
      });
    })
    .catch((error) => {
      failedUniversities.push({ name, url }); // 加入候补队列
      logError(`无法镜像 ${name} 的主页: ${error.message}`);
    });
}

function processFailedUniversities() {
  const promises = failedUniversities.map(({ url, name }) => {
    return fetch(url)
      .then((content) => {
        const filePath = path.join(__dirname, "mirrored_pages", `${name}.html`);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        return fs.promises.writeFile(filePath, content, "utf8").then(() => {
          console.log(`成功镜像 ${name} 的主页到 ${filePath}`);
        });
      })
      .catch((error) => {
        logError(`再次尝试镜像 ${name} 的主页失败: ${error.message}`);
      });
  });

  Promise.allSettled(promises).then(() => {
    console.log("候补队列处理完毕。");
  });
}

function logError(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
}

function write(fileName, jsonData) {
  fs.writeFile(fileName, JSON.stringify(jsonData, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log(`学校数据已成功写入 ${fileName}`);
    }
  });
}

make();
