export async function onRequest(context) {
    // 获取远程内容及其类型
    const { request, env } = context;
    let targetUrl = decodeURIComponent(context.params.path);
    console.log(targetUrl);
    console.log(request.url);
    //校验 url 是否 http/https
    if (!targetUrl.match(/^https?:\/\//i)) {
        const url = new URL(request.url);
        targetUrl = getTargetUrlFromPath(url.pathname);
    }
    console.log(targetUrl);


    // Handle OPTIONS requests for CORS preflight
    if (request.method === "OPTIONS") {
        return onOptions(context);
    }

    // Create headers for the forwarded request
    const headers = new Headers();

    // Copy relevant headers from the original request
    request.headers.forEach((value, key) => {
        // Skip the host header as it will be set automatically
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    try {
        // Forward the request to orr.com with the same method and body
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.clone().arrayBuffer() : undefined,
            redirect: 'follow'
        });

        const content = await response.text();

        // Create response headers
        const responseHeaders = new Headers();

        // Copy headers from the orr.com response
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'host') {
                let host = request.headers.get('host');
                responseHeaders.set(key, host);
            }
            // else {
            //     responseHeaders.set(key, value);
            // }
        });

        // Add CORS headers to allow cross-origin requests
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "*");

        // Return the response from orr.com
        return new Response(content, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });
    } catch (error) {
        // Return an error response if the request fails
        return new Response(`Error proxying: ${error.message}`, {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}

// 从请求路径中提取目标 URL
function getTargetUrlFromPath(pathname) {
    // 路径格式: /proxy/经过编码的URL
    // 例如: /proxy/https%3A%2F%2Fexample.com%2Fplaylist.m3u8
    const encodedUrl = pathname.replace(/^\/api\//, '');
    if (!encodedUrl) return null;
    try {
        // 解码
        let decodedUrl = decodeURIComponent(encodedUrl);

        // 简单检查解码后是否是有效的 http/https URL
        if (!decodedUrl.match(/^https?:\/\//i)) {
            // 也许原始路径就没有编码？如果看起来像URL就直接用
            if (encodedUrl.match(/^https?:\/\//i)) {
                decodedUrl = encodedUrl;
                logDebug(`Warning: Path was not encoded but looks like URL: ${decodedUrl}`);
            } else {
                logDebug(`无效的目标URL格式 (解码后): ${decodedUrl}`);
                return null;
            }
        }
        return decodedUrl;

    } catch (e) {
        logDebug(`解码目标URL时出错: ${encodedUrl} - ${e.message}`);
        return null;
    }
}

// Handle OPTIONS preflight requests
export async function onOptions(context) {
    return new Response(null, {
        status: 204, // No Content
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400", // Cache preflight response for 24 hours
        },
    });
}
