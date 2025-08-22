
      let global = globalThis;

      class MessageChannel {
        constructor() {
          this.port1 = new MessagePort();
          this.port2 = new MessagePort();
        }
      }
      class MessagePort {
        constructor() {
          this.onmessage = null;
        }
        postMessage(data) {
          if (this.onmessage) {
            setTimeout(() => this.onmessage({ data }), 0);
          }
        }
      }
      global.MessageChannel = MessageChannel;

      let routeParams = {};
      let pagesFunctionResponse = null;
      async function handleRequest(context){
        const request = context.request;
        const urlInfo = new URL(request.url);

        if (urlInfo.pathname !== '/' && urlInfo.pathname.endsWith('/')) {
          urlInfo.pathname = urlInfo.pathname.slice(0, -1);
        }

        let matchedFunc = false;
        
          if(/^\/api\/(.+?)$/.test(urlInfo.pathname)) {
            routeParams = {"id":"path","mode":2,"left":"/api/"};
            matchedFunc = true;
            (() => {
  // functions/api/[[path]].js
  async function onRequest(context) {
    const { request, env } = context;
    let targetUrl = decodeURIComponent(context.params.path);
    console.log(targetUrl);
    console.log(request.url);
    if (!targetUrl.match(/^https?:\/\//i)) {
      const url = new URL(request.url);
      targetUrl = getTargetUrlFromPath(url.pathname);
    }
    console.log(targetUrl);
    if (request.method === "OPTIONS") {
      return onOptions(context);
    }
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });
    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: request.method !== "GET" && request.method !== "HEAD" ? await request.clone().arrayBuffer() : void 0,
        redirect: "follow"
      });
      const content = await response.text();
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "host") {
          let host = request.headers.get("host");
          responseHeaders.set(key, host);
        }
      });
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "*");
      return new Response(content, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      return new Response(`Error proxying: ${error.message}`, {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
  function getTargetUrlFromPath(pathname) {
    const encodedUrl = pathname.replace(/^\/api\//, "");
    if (!encodedUrl)
      return null;
    try {
      let decodedUrl = decodeURIComponent(encodedUrl);
      if (!decodedUrl.match(/^https?:\/\//i)) {
        if (encodedUrl.match(/^https?:\/\//i)) {
          decodedUrl = encodedUrl;
          logDebug(`Warning: Path was not encoded but looks like URL: ${decodedUrl}`);
        } else {
          logDebug(`\u65E0\u6548\u7684\u76EE\u6807URL\u683C\u5F0F (\u89E3\u7801\u540E): ${decodedUrl}`);
          return null;
        }
      }
      return decodedUrl;
    } catch (e) {
      logDebug(`\u89E3\u7801\u76EE\u6807URL\u65F6\u51FA\u9519: ${encodedUrl} - ${e.message}`);
      return null;
    }
  }
  async function onOptions(context) {
    return new Response(null, {
      status: 204,
      // No Content
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Max-Age": "86400"
        // Cache preflight response for 24 hours
      }
    });
  }

        pagesFunctionResponse = onRequest;
      })();
          }
        
          if(/^\/proxy\/(.+?)$/.test(urlInfo.pathname)) {
            routeParams = {"id":"path","mode":2,"left":"/proxy/"};
            matchedFunc = true;
            (() => {
  // functions/proxy/[[path]].js
  var MEDIA_FILE_EXTENSIONS = [
    ".mp4",
    ".webm",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".f4v",
    ".m4v",
    ".3gp",
    ".3g2",
    ".ts",
    ".mts",
    ".m2ts",
    ".mp3",
    ".wav",
    ".ogg",
    ".aac",
    ".m4a",
    ".flac",
    ".wma",
    ".alac",
    ".aiff",
    ".opus",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".tiff",
    ".svg",
    ".avif",
    ".heic"
  ];
  var MEDIA_CONTENT_TYPES = ["video/", "audio/", "image/"];
  async function onRequest(context) {
    const { request, env, next, waitUntil } = context;
    const url = new URL(request.url);
    const DEBUG_ENABLED = env.DEBUG === "true";
    const CACHE_TTL = parseInt(env.CACHE_TTL || "86400");
    const MAX_RECURSION = parseInt(env.MAX_RECURSION || "5");
    let USER_AGENTS = [
      // 提供一个基础的默认值
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ];
    try {
      const agentsJson = env.USER_AGENTS_JSON;
      if (agentsJson) {
        const parsedAgents = JSON.parse(agentsJson);
        if (Array.isArray(parsedAgents) && parsedAgents.length > 0) {
          USER_AGENTS = parsedAgents;
        } else {
          logDebug("\u73AF\u5883\u53D8\u91CF USER_AGENTS_JSON \u683C\u5F0F\u65E0\u6548\u6216\u4E3A\u7A7A\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u503C");
        }
      }
    } catch (e) {
      logDebug(`\u89E3\u6790\u73AF\u5883\u53D8\u91CF USER_AGENTS_JSON \u5931\u8D25: ${e.message}\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u503C`);
    }
    function logDebug(message) {
      if (DEBUG_ENABLED) {
        console.log(`[Proxy Func] ${message}`);
      }
    }
    function getTargetUrlFromPath(pathname) {
      const encodedUrl = pathname.replace(/^\/proxy\//, "");
      if (!encodedUrl)
        return null;
      try {
        let decodedUrl = decodeURIComponent(encodedUrl);
        if (!decodedUrl.match(/^https?:\/\//i)) {
          if (encodedUrl.match(/^https?:\/\//i)) {
            decodedUrl = encodedUrl;
            logDebug(`Warning: Path was not encoded but looks like URL: ${decodedUrl}`);
          } else {
            logDebug(`\u65E0\u6548\u7684\u76EE\u6807URL\u683C\u5F0F (\u89E3\u7801\u540E): ${decodedUrl}`);
            return null;
          }
        }
        return decodedUrl;
      } catch (e) {
        logDebug(`\u89E3\u7801\u76EE\u6807URL\u65F6\u51FA\u9519: ${encodedUrl} - ${e.message}`);
        return null;
      }
    }
    function createResponse(body, status = 200, headers = {}) {
      const responseHeaders = new Headers(headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
      responseHeaders.set("Access-Control-Allow-Headers", "*");
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          // No Content
          headers: responseHeaders
          // 包含上面设置的 CORS 头
        });
      }
      return new Response(body, { status, headers: responseHeaders });
    }
    function createM3u8Response(content) {
      return createResponse(content, 200, {
        "Content-Type": "application/vnd.apple.mpegurl",
        // M3U8 的标准 MIME 类型
        "Cache-Control": `public, max-age=${CACHE_TTL}`
        // 允许浏览器和CDN缓存
      });
    }
    function getRandomUserAgent() {
      return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    }
    function getBaseUrl(urlStr) {
      try {
        const parsedUrl = new URL(urlStr);
        if (!parsedUrl.pathname || parsedUrl.pathname === "/") {
          return `${parsedUrl.origin}/`;
        }
        const pathParts = parsedUrl.pathname.split("/");
        pathParts.pop();
        return `${parsedUrl.origin}${pathParts.join("/")}/`;
      } catch (e) {
        logDebug(`\u83B7\u53D6 BaseUrl \u65F6\u51FA\u9519: ${urlStr} - ${e.message}`);
        const lastSlashIndex = urlStr.lastIndexOf("/");
        return lastSlashIndex > urlStr.indexOf("://") + 2 ? urlStr.substring(0, lastSlashIndex + 1) : urlStr + "/";
      }
    }
    function resolveUrl(baseUrl, relativeUrl) {
      if (relativeUrl.match(/^https?:\/\//i)) {
        return relativeUrl;
      }
      try {
        return new URL(relativeUrl, baseUrl).toString();
      } catch (e) {
        logDebug(`\u89E3\u6790 URL \u5931\u8D25: baseUrl=${baseUrl}, relativeUrl=${relativeUrl}, error=${e.message}`);
        if (relativeUrl.startsWith("/")) {
          const urlObj = new URL(baseUrl);
          return `${urlObj.origin}${relativeUrl}`;
        }
        return `${baseUrl.replace(/\/[^/]*$/, "/")}${relativeUrl}`;
      }
    }
    function rewriteUrlToProxy(targetUrl) {
      return `/proxy/${encodeURIComponent(targetUrl)}`;
    }
    async function fetchContentWithType(targetUrl) {
      const headers = new Headers({
        "User-Agent": getRandomUserAgent(),
        "Accept": "*/*",
        // 尝试传递一些原始请求的头信息
        "Accept-Language": request.headers.get("Accept-Language") || "zh-CN,zh;q=0.9,en;q=0.8",
        // 尝试设置 Referer 为目标网站的域名，或者传递原始 Referer
        "Referer": request.headers.get("Referer") || new URL(targetUrl).origin
      });
      try {
        logDebug(`\u5F00\u59CB\u76F4\u63A5\u8BF7\u6C42: ${targetUrl}`);
        const response = await fetch(targetUrl, { headers, redirect: "follow" });
        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          logDebug(`\u8BF7\u6C42\u5931\u8D25: ${response.status} ${response.statusText} - ${targetUrl}`);
          throw new Error(`HTTP error ${response.status}: ${response.statusText}. URL: ${targetUrl}. Body: ${errorBody.substring(0, 150)}`);
        }
        const content = await response.text();
        const contentType = response.headers.get("Content-Type") || "";
        logDebug(`\u8BF7\u6C42\u6210\u529F: ${targetUrl}, Content-Type: ${contentType}, \u5185\u5BB9\u957F\u5EA6: ${content.length}`);
        return { content, contentType, responseHeaders: response.headers };
      } catch (error) {
        logDebug(`\u8BF7\u6C42\u5F7B\u5E95\u5931\u8D25: ${targetUrl}: ${error.message}`);
        throw new Error(`\u8BF7\u6C42\u76EE\u6807URL\u5931\u8D25 ${targetUrl}: ${error.message}`);
      }
    }
    function isM3u8Content(content, contentType) {
      if (contentType && (contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegurl") || contentType.includes("audio/mpegurl"))) {
        return true;
      }
      return content && typeof content === "string" && content.trim().startsWith("#EXTM3U");
    }
    function isMediaFile(url2, contentType) {
      if (contentType) {
        for (const mediaType of MEDIA_CONTENT_TYPES) {
          if (contentType.toLowerCase().startsWith(mediaType)) {
            return true;
          }
        }
      }
      const urlLower = url2.toLowerCase();
      for (const ext of MEDIA_FILE_EXTENSIONS) {
        if (urlLower.endsWith(ext) || urlLower.includes(`${ext}?`)) {
          return true;
        }
      }
      return false;
    }
    function processKeyLine(line, baseUrl) {
      return line.replace(/URI="([^"]+)"/, (match, uri) => {
        const absoluteUri = resolveUrl(baseUrl, uri);
        logDebug(`\u5904\u7406 KEY URI: \u539F\u59CB='${uri}', \u7EDD\u5BF9='${absoluteUri}'`);
        return `URI="${rewriteUrlToProxy(absoluteUri)}"`;
      });
    }
    function processMapLine(line, baseUrl) {
      return line.replace(/URI="([^"]+)"/, (match, uri) => {
        const absoluteUri = resolveUrl(baseUrl, uri);
        logDebug(`\u5904\u7406 MAP URI: \u539F\u59CB='${uri}', \u7EDD\u5BF9='${absoluteUri}'`);
        return `URI="${rewriteUrlToProxy(absoluteUri)}"`;
      });
    }
    function processMediaPlaylist(url2, content) {
      const baseUrl = getBaseUrl(url2);
      const lines = content.split("\n");
      const output = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line && i === lines.length - 1) {
          output.push(line);
          continue;
        }
        if (!line)
          continue;
        if (line.startsWith("#EXT-X-KEY")) {
          output.push(processKeyLine(line, baseUrl));
          continue;
        }
        if (line.startsWith("#EXT-X-MAP")) {
          output.push(processMapLine(line, baseUrl));
          continue;
        }
        if (line.startsWith("#EXTINF")) {
          output.push(line);
          continue;
        }
        if (!line.startsWith("#")) {
          const absoluteUrl = resolveUrl(baseUrl, line);
          logDebug(`\u91CD\u5199\u5A92\u4F53\u7247\u6BB5: \u539F\u59CB='${line}', \u7EDD\u5BF9='${absoluteUrl}'`);
          output.push(rewriteUrlToProxy(absoluteUrl));
          continue;
        }
        output.push(line);
      }
      return output.join("\n");
    }
    async function processM3u8Content(targetUrl, content, recursionDepth = 0, env2) {
      if (content.includes("#EXT-X-STREAM-INF") || content.includes("#EXT-X-MEDIA:")) {
        logDebug(`\u68C0\u6D4B\u5230\u4E3B\u64AD\u653E\u5217\u8868: ${targetUrl}`);
        return await processMasterPlaylist(targetUrl, content, recursionDepth, env2);
      }
      logDebug(`\u68C0\u6D4B\u5230\u5A92\u4F53\u64AD\u653E\u5217\u8868: ${targetUrl}`);
      return processMediaPlaylist(targetUrl, content);
    }
    async function processMasterPlaylist(url2, content, recursionDepth, env2) {
      if (recursionDepth > MAX_RECURSION) {
        throw new Error(`\u5904\u7406\u4E3B\u5217\u8868\u65F6\u9012\u5F52\u5C42\u6570\u8FC7\u591A (${MAX_RECURSION}): ${url2}`);
      }
      const baseUrl = getBaseUrl(url2);
      const lines = content.split("\n");
      let highestBandwidth = -1;
      let bestVariantUrl = "";
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
          const bandwidthMatch = lines[i].match(/BANDWIDTH=(\d+)/);
          const currentBandwidth = bandwidthMatch ? parseInt(bandwidthMatch[1], 10) : 0;
          let variantUriLine = "";
          for (let j = i + 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line && !line.startsWith("#")) {
              variantUriLine = line;
              i = j;
              break;
            }
          }
          if (variantUriLine && currentBandwidth >= highestBandwidth) {
            highestBandwidth = currentBandwidth;
            bestVariantUrl = resolveUrl(baseUrl, variantUriLine);
          }
        }
      }
      if (!bestVariantUrl) {
        logDebug(`\u4E3B\u5217\u8868\u4E2D\u672A\u627E\u5230 BANDWIDTH \u6216 STREAM-INF\uFF0C\u5C1D\u8BD5\u67E5\u627E\u7B2C\u4E00\u4E2A\u5B50\u5217\u8868\u5F15\u7528: ${url2}`);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.startsWith("#") && (line.endsWith(".m3u8") || line.includes(".m3u8?"))) {
            bestVariantUrl = resolveUrl(baseUrl, line);
            logDebug(`\u5907\u9009\u65B9\u6848\uFF1A\u627E\u5230\u7B2C\u4E00\u4E2A\u5B50\u5217\u8868\u5F15\u7528: ${bestVariantUrl}`);
            break;
          }
        }
      }
      if (!bestVariantUrl) {
        logDebug(`\u5728\u4E3B\u5217\u8868 ${url2} \u4E2D\u672A\u627E\u5230\u4EFB\u4F55\u6709\u6548\u7684\u5B50\u64AD\u653E\u5217\u8868 URL\u3002\u53EF\u80FD\u683C\u5F0F\u6709\u95EE\u9898\u6216\u4EC5\u5305\u542B\u97F3\u9891/\u5B57\u5E55\u3002\u5C06\u5C1D\u8BD5\u6309\u5A92\u4F53\u5217\u8868\u5904\u7406\u539F\u59CB\u5185\u5BB9\u3002`);
        return processMediaPlaylist(url2, content);
      }
      const cacheKey = `m3u8_processed:${bestVariantUrl}`;
      let kvNamespace = null;
      try {
        kvNamespace = env2.LIBRETV_PROXY_KV;
        if (!kvNamespace)
          throw new Error("KV \u547D\u540D\u7A7A\u95F4\u672A\u7ED1\u5B9A");
      } catch (e) {
        logDebug(`KV \u547D\u540D\u7A7A\u95F4 'LIBRETV_PROXY_KV' \u8BBF\u95EE\u51FA\u9519\u6216\u672A\u7ED1\u5B9A: ${e.message}`);
        kvNamespace = null;
      }
      if (kvNamespace) {
        try {
          const cachedContent = await kvNamespace.get(cacheKey);
          if (cachedContent) {
            logDebug(`[\u7F13\u5B58\u547D\u4E2D] \u4E3B\u5217\u8868\u7684\u5B50\u5217\u8868: ${bestVariantUrl}`);
            return cachedContent;
          } else {
            logDebug(`[\u7F13\u5B58\u672A\u547D\u4E2D] \u4E3B\u5217\u8868\u7684\u5B50\u5217\u8868: ${bestVariantUrl}`);
          }
        } catch (kvError) {
          logDebug(`\u4ECE KV \u8BFB\u53D6\u7F13\u5B58\u5931\u8D25 (${cacheKey}): ${kvError.message}`);
        }
      }
      logDebug(`\u9009\u62E9\u7684\u5B50\u5217\u8868 (\u5E26\u5BBD: ${highestBandwidth}): ${bestVariantUrl}`);
      const { content: variantContent, contentType: variantContentType } = await fetchContentWithType(bestVariantUrl);
      if (!isM3u8Content(variantContent, variantContentType)) {
        logDebug(`\u83B7\u53D6\u5230\u7684\u5B50\u5217\u8868 ${bestVariantUrl} \u4E0D\u662F M3U8 \u5185\u5BB9 (\u7C7B\u578B: ${variantContentType})\u3002\u53EF\u80FD\u76F4\u63A5\u662F\u5A92\u4F53\u6587\u4EF6\uFF0C\u8FD4\u56DE\u539F\u59CB\u5185\u5BB9\u3002`);
        return processMediaPlaylist(bestVariantUrl, variantContent);
      }
      const processedVariant = await processM3u8Content(bestVariantUrl, variantContent, recursionDepth + 1, env2);
      if (kvNamespace) {
        try {
          waitUntil(kvNamespace.put(cacheKey, processedVariant, { expirationTtl: CACHE_TTL }));
          logDebug(`\u5DF2\u5C06\u5904\u7406\u540E\u7684\u5B50\u5217\u8868\u5199\u5165\u7F13\u5B58: ${bestVariantUrl}`);
        } catch (kvError) {
          logDebug(`\u5411 KV \u5199\u5165\u7F13\u5B58\u5931\u8D25 (${cacheKey}): ${kvError.message}`);
        }
      }
      return processedVariant;
    }
    try {
      const targetUrl = getTargetUrlFromPath(url.pathname);
      if (!targetUrl) {
        logDebug(`\u65E0\u6548\u7684\u4EE3\u7406\u8BF7\u6C42\u8DEF\u5F84: ${url.pathname}`);
        return createResponse("\u65E0\u6548\u7684\u4EE3\u7406\u8BF7\u6C42\u3002\u8DEF\u5F84\u5E94\u4E3A /proxy/<\u7ECF\u8FC7\u7F16\u7801\u7684URL>", 400);
      }
      logDebug(`\u6536\u5230\u4EE3\u7406\u8BF7\u6C42: ${targetUrl}`);
      const cacheKey = `proxy_raw:${targetUrl}`;
      let kvNamespace = null;
      try {
        kvNamespace = env.LIBRETV_PROXY_KV;
        if (!kvNamespace)
          throw new Error("KV \u547D\u540D\u7A7A\u95F4\u672A\u7ED1\u5B9A");
      } catch (e) {
        logDebug(`KV \u547D\u540D\u7A7A\u95F4 'LIBRETV_PROXY_KV' \u8BBF\u95EE\u51FA\u9519\u6216\u672A\u7ED1\u5B9A: ${e.message}`);
        kvNamespace = null;
      }
      if (kvNamespace) {
        try {
          const cachedDataJson = await kvNamespace.get(cacheKey);
          if (cachedDataJson) {
            logDebug(`[\u7F13\u5B58\u547D\u4E2D] \u539F\u59CB\u5185\u5BB9: ${targetUrl}`);
            const cachedData = JSON.parse(cachedDataJson);
            const content2 = cachedData.body;
            let headers = {};
            try {
              headers = JSON.parse(cachedData.headers);
            } catch (e) {
            }
            const contentType2 = headers["content-type"] || headers["Content-Type"] || "";
            if (isM3u8Content(content2, contentType2)) {
              logDebug(`\u7F13\u5B58\u5185\u5BB9\u662F M3U8\uFF0C\u91CD\u65B0\u5904\u7406: ${targetUrl}`);
              const processedM3u8 = await processM3u8Content(targetUrl, content2, 0, env);
              return createM3u8Response(processedM3u8);
            } else {
              logDebug(`\u4ECE\u7F13\u5B58\u8FD4\u56DE\u975E M3U8 \u5185\u5BB9: ${targetUrl}`);
              return createResponse(content2, 200, new Headers(headers));
            }
          } else {
            logDebug(`[\u7F13\u5B58\u672A\u547D\u4E2D] \u539F\u59CB\u5185\u5BB9: ${targetUrl}`);
          }
        } catch (kvError) {
          logDebug(`\u4ECE KV \u8BFB\u53D6\u6216\u89E3\u6790\u7F13\u5B58\u5931\u8D25 (${cacheKey}): ${kvError.message}`);
        }
      }
      const { content, contentType, responseHeaders } = await fetchContentWithType(targetUrl);
      if (kvNamespace) {
        try {
          const headersToCache = {};
          responseHeaders.forEach((value, key) => {
            headersToCache[key.toLowerCase()] = value;
          });
          const cacheValue = { body: content, headers: JSON.stringify(headersToCache) };
          waitUntil(kvNamespace.put(cacheKey, JSON.stringify(cacheValue), { expirationTtl: CACHE_TTL }));
          logDebug(`\u5DF2\u5C06\u539F\u59CB\u5185\u5BB9\u5199\u5165\u7F13\u5B58: ${targetUrl}`);
        } catch (kvError) {
          logDebug(`\u5411 KV \u5199\u5165\u7F13\u5B58\u5931\u8D25 (${cacheKey}): ${kvError.message}`);
        }
      }
      if (isM3u8Content(content, contentType)) {
        logDebug(`\u5185\u5BB9\u662F M3U8\uFF0C\u5F00\u59CB\u5904\u7406: ${targetUrl}`);
        const processedM3u8 = await processM3u8Content(targetUrl, content, 0, env);
        return createM3u8Response(processedM3u8);
      } else {
        logDebug(`\u5185\u5BB9\u4E0D\u662F M3U8 (\u7C7B\u578B: ${contentType})\uFF0C\u76F4\u63A5\u8FD4\u56DE: ${targetUrl}`);
        const finalHeaders = new Headers(responseHeaders);
        finalHeaders.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
        finalHeaders.set("Access-Control-Allow-Origin", "*");
        finalHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
        finalHeaders.set("Access-Control-Allow-Headers", "*");
        return createResponse(content, 200, finalHeaders);
      }
    } catch (error) {
      logDebug(`\u5904\u7406\u4EE3\u7406\u8BF7\u6C42\u65F6\u53D1\u751F\u4E25\u91CD\u9519\u8BEF: ${error.message} 
 ${error.stack}`);
      return createResponse(`\u4EE3\u7406\u5904\u7406\u9519\u8BEF: ${error.message}`, 500);
    }
  }
  async function onOptions(context) {
    return new Response(null, {
      status: 204,
      // No Content
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        // 允许所有请求头
        "Access-Control-Max-Age": "86400"
        // 预检请求结果缓存一天
      }
    });
  }

        pagesFunctionResponse = onRequest;
      })();
          }
        

        const params = {};
        if (routeParams.id) {
          if (routeParams.mode === 1) {
            const value = urlInfo.pathname.match(routeParams.left);        
            for (let i = 1; i < value.length; i++) {
              params[routeParams.id[i - 1]] = value[i];
            }
          } else {
            const value = urlInfo.pathname.replace(routeParams.left, '');
            const splitedValue = value.split('/');
            if (splitedValue.length === 1) {
              params[routeParams.id] = splitedValue[0];
            } else {
              params[routeParams.id] = splitedValue;
            }
          }
          
        }
        if(!matchedFunc){
          pagesFunctionResponse = function() {
            return new Response(null, {
              status: 404,
              headers: {
                "content-type": "text/html; charset=UTF-8",
                "x-edgefunctions-test": "Welcome to use Pages Functions.",
              },
            });
          }
        }
        return pagesFunctionResponse({request, params, env: {"PATH":"/Users/arick/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.23.8.darwin-arm64/bin:/Users/arick/go/bin:/opt/homebrew/opt/mysql-client/bin:/Users/arick/.local/bin:/Users/arick/project/google-cloud-sdk/bin:/Users/arick/micromamba/bin:/Users/arick/micromamba/condabin:/Users/arick/.yarn/bin:/Users/arick/.config/yarn/global/node_modules/.bin:/Users/arick/.vm/bin:/Users/arick/.vm/versions/nodejs_versions/nodejs/bin:/Users/arick/go/bin:/Users/arick/.vm/versions/go_versions/go/bin:/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/Applications/Yunshu.app/Contents/Public:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Library/Apple/usr/bin:/Users/arick/.vm/versions/rust_versions/cargo/bin:/Users/arick/.orbstack/bin:/Users/arick/Library/Application Support/JetBrains/Toolbox/scripts:/opt/metasploit-framework/bin:/Users/arick/Library/Android/sdk/platform-tools:/Users/arick/Library/Android/sdk/emulator:/Users/arick/Library/Android/sdk/tools:/Users/arick/Library/Android/sdk/build-tools/35.0.0:/Users/arick/Library/Android/sdk/tools/bin:/Users/arick/Library/Android/sdk/cmdline-tools/bin","TERM":"xterm-256color","COMMAND_MODE":"unix2003","LOGNAME":"arick","XPC_SERVICE_NAME":"0","__CFBundleIdentifier":"com.jetbrains.goland","SHELL":"/bin/zsh","GOPATH":"/Users/arick/go","USER":"arick","GOROOT":"/Users/arick/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.23.8.darwin-arm64","TMPDIR":"/var/folders/sj/vsfbhxy161g2jsw5tb0zqngw0000gp/T/","TERMINAL_EMULATOR":"JetBrains-JediTerm","GO111MODULE":"on","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.TQKZcja9vW/Listeners","XPC_FLAGS":"0x0","TERM_SESSION_ID":"e9125e43-1d28-4062-8af1-68d215bb9eec","__CF_USER_TEXT_ENCODING":"0x1F6:0x19:0x34","LC_CTYPE":"UTF-8","HOME":"/Users/arick","SHLVL":"1","PWD":"/Users/arick/project/note/code/wschat/LibreTV","OLDPWD":"/Users/arick/project/note/code/wschat","HOMEBREW_PREFIX":"/opt/homebrew","HOMEBREW_CELLAR":"/opt/homebrew/Cellar","HOMEBREW_REPOSITORY":"/opt/homebrew","INFOPATH":"/opt/homebrew/share/info:","ZSH":"/Users/arick/.oh-my-zsh","PAGER":"less","LESS":"-R","LSCOLORS":"Gxfxcxdxbxegedabagacad","LS_COLORS":"di=1;36:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43","P9K_SSH":"0","_P9K_SSH_TTY":"/dev/ttys006","HISTSIZE":"5000","HISTFILESIZE":"450","HISTCONTROL":"ignoredups","REPO_URL":"https://mirrors.tuna.tsinghua.edu.cn/git/git-repo","JAVA_HOME":"/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home","ANDROID_HOME":"/Users/arick/Library/Android/sdk","GOBIN":"/Users/arick/go/bin","G_MIRROR":"https://golang.google.cn/dl/","GOPROXY":"https://goproxy.cn,direct","MCFLY_HISTFILE":"/Users/arick/.zsh_history","MCFLY_SESSION_ID":"kUeMmREUgzubwwh6MZHwh07r","MCFLY_HISTORY":"/var/folders/sj/vsfbhxy161g2jsw5tb0zqngw0000gp/T//mcfly.atAMIMiZ","MCFLY_HISTORY_FORMAT":"zsh-extended","RUSTUP_DIST_SERVER":"https://rsproxy.cn","RUSTUP_UPDATE_ROOT":"https://rsproxy.cn/rustup","RELEASE_STORE_PASSWORD":"ps20201020","MAMBA_EXE":"/Users/arick/.micromamba/bin/micromamba","MAMBA_ROOT_PREFIX":"/Users/arick/micromamba","CONDA_SHLVL":"1","CONDA_EXE":"/Users/arick/micromamba/bin/conda","_CE_M":"","_CE_CONDA":"","CONDA_PYTHON_EXE":"/Users/arick/micromamba/bin/python","CONDA_PREFIX":"/Users/arick/micromamba","CONDA_DEFAULT_ENV":"base","CONDA_PROMPT_MODIFIER":"(base) ","XML_CATALOG_FILES":"file:///Users/arick/micromamba/etc/xml/catalog file:///etc/xml/catalog","ENVMAN_LOAD":"loaded","LDFLAGS":"-L/opt/homebrew/opt/mysql-client/lib","CPPFLAGS":"-I/opt/homebrew/opt/mysql-client/include","P9K_TTY":"old","_P9K_TTY":"/dev/ttys006","_":"/Users/arick/.vm/versions/nodejs_versions/nodejs/bin/edgeone","AppId":"1304040017"} });
      }addEventListener('fetch',event=>{return event.respondWith(handleRequest({request:event.request,params: {}, env: {"PATH":"/Users/arick/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.23.8.darwin-arm64/bin:/Users/arick/go/bin:/opt/homebrew/opt/mysql-client/bin:/Users/arick/.local/bin:/Users/arick/project/google-cloud-sdk/bin:/Users/arick/micromamba/bin:/Users/arick/micromamba/condabin:/Users/arick/.yarn/bin:/Users/arick/.config/yarn/global/node_modules/.bin:/Users/arick/.vm/bin:/Users/arick/.vm/versions/nodejs_versions/nodejs/bin:/Users/arick/go/bin:/Users/arick/.vm/versions/go_versions/go/bin:/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/Applications/Yunshu.app/Contents/Public:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/Library/Apple/usr/bin:/Users/arick/.vm/versions/rust_versions/cargo/bin:/Users/arick/.orbstack/bin:/Users/arick/Library/Application Support/JetBrains/Toolbox/scripts:/opt/metasploit-framework/bin:/Users/arick/Library/Android/sdk/platform-tools:/Users/arick/Library/Android/sdk/emulator:/Users/arick/Library/Android/sdk/tools:/Users/arick/Library/Android/sdk/build-tools/35.0.0:/Users/arick/Library/Android/sdk/tools/bin:/Users/arick/Library/Android/sdk/cmdline-tools/bin","TERM":"xterm-256color","COMMAND_MODE":"unix2003","LOGNAME":"arick","XPC_SERVICE_NAME":"0","__CFBundleIdentifier":"com.jetbrains.goland","SHELL":"/bin/zsh","GOPATH":"/Users/arick/go","USER":"arick","GOROOT":"/Users/arick/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.23.8.darwin-arm64","TMPDIR":"/var/folders/sj/vsfbhxy161g2jsw5tb0zqngw0000gp/T/","TERMINAL_EMULATOR":"JetBrains-JediTerm","GO111MODULE":"on","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.TQKZcja9vW/Listeners","XPC_FLAGS":"0x0","TERM_SESSION_ID":"e9125e43-1d28-4062-8af1-68d215bb9eec","__CF_USER_TEXT_ENCODING":"0x1F6:0x19:0x34","LC_CTYPE":"UTF-8","HOME":"/Users/arick","SHLVL":"1","PWD":"/Users/arick/project/note/code/wschat/LibreTV","OLDPWD":"/Users/arick/project/note/code/wschat","HOMEBREW_PREFIX":"/opt/homebrew","HOMEBREW_CELLAR":"/opt/homebrew/Cellar","HOMEBREW_REPOSITORY":"/opt/homebrew","INFOPATH":"/opt/homebrew/share/info:","ZSH":"/Users/arick/.oh-my-zsh","PAGER":"less","LESS":"-R","LSCOLORS":"Gxfxcxdxbxegedabagacad","LS_COLORS":"di=1;36:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43","P9K_SSH":"0","_P9K_SSH_TTY":"/dev/ttys006","HISTSIZE":"5000","HISTFILESIZE":"450","HISTCONTROL":"ignoredups","REPO_URL":"https://mirrors.tuna.tsinghua.edu.cn/git/git-repo","JAVA_HOME":"/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home","ANDROID_HOME":"/Users/arick/Library/Android/sdk","GOBIN":"/Users/arick/go/bin","G_MIRROR":"https://golang.google.cn/dl/","GOPROXY":"https://goproxy.cn,direct","MCFLY_HISTFILE":"/Users/arick/.zsh_history","MCFLY_SESSION_ID":"kUeMmREUgzubwwh6MZHwh07r","MCFLY_HISTORY":"/var/folders/sj/vsfbhxy161g2jsw5tb0zqngw0000gp/T//mcfly.atAMIMiZ","MCFLY_HISTORY_FORMAT":"zsh-extended","RUSTUP_DIST_SERVER":"https://rsproxy.cn","RUSTUP_UPDATE_ROOT":"https://rsproxy.cn/rustup","RELEASE_STORE_PASSWORD":"ps20201020","MAMBA_EXE":"/Users/arick/.micromamba/bin/micromamba","MAMBA_ROOT_PREFIX":"/Users/arick/micromamba","CONDA_SHLVL":"1","CONDA_EXE":"/Users/arick/micromamba/bin/conda","_CE_M":"","_CE_CONDA":"","CONDA_PYTHON_EXE":"/Users/arick/micromamba/bin/python","CONDA_PREFIX":"/Users/arick/micromamba","CONDA_DEFAULT_ENV":"base","CONDA_PROMPT_MODIFIER":"(base) ","XML_CATALOG_FILES":"file:///Users/arick/micromamba/etc/xml/catalog file:///etc/xml/catalog","ENVMAN_LOAD":"loaded","LDFLAGS":"-L/opt/homebrew/opt/mysql-client/lib","CPPFLAGS":"-I/opt/homebrew/opt/mysql-client/include","P9K_TTY":"old","_P9K_TTY":"/dev/ttys006","_":"/Users/arick/.vm/versions/nodejs_versions/nodejs/bin/edgeone","AppId":"1304040017"} }))});