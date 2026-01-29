globalThis.__nitro_main__ = import.meta.url;
import { N as NodeResponse, s as serve } from "./_libs/srvx.mjs";
import { d as defineHandler, H as HTTPError, t as toEventHandler, a as defineLazyEventHandler, b as H3Core, c as HTTPResponse } from "./_libs/h3.mjs";
import { d as decodePath, w as withLeadingSlash, a as withoutTrailingSlash, j as joinURL } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import "node:http";
import "node:stream";
import "node:https";
import "node:http2";
import "./_libs/rou3.mjs";
const services = {};
globalThis.__nitro_vite_envs__ = services;
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled;
  const status = error.status || 500;
  const url = event.url || new URL(event.req.url);
  if (status === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.req.method}] ${url}
`, error);
  }
  const headers2 = {
    "content-type": "application/json",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  if (status === 404 || !event.res.headers.has("cache-control")) {
    headers2["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    status,
    statusText: error.statusText,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status,
    statusText: error.statusText,
    headers: headers2,
    body
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key2, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key2, value);
  }
});
const assets = {
  "/manifest.json": {
    "type": "application/json",
    "etag": '"1f2-Oqn/x1R1hBTtEjA8nFhpBeFJJNg"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 498,
    "path": "../public/manifest.json"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": '"f1e-ESBTjHetHyiokkO0tT/irBbMO8Y"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 3870,
    "path": "../public/favicon.ico"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"43-BEzmj4PuhUNHX+oW9uOnPSihxtU"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 67,
    "path": "../public/robots.txt"
  },
  "/logo512.png": {
    "type": "image/png",
    "etag": '"25c0-RpFfnQJpTtSb/HqVNJR2hBA9w/4"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 9664,
    "path": "../public/logo512.png"
  },
  "/tanstack-word-logo-white.svg": {
    "type": "image/svg+xml",
    "etag": '"3a9a-9TQFm/pN8AZe1ZK0G1KyCEojnYg"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 15002,
    "path": "../public/tanstack-word-logo-white.svg"
  },
  "/assets/api-Df4qyv35.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1bb-NSoXLEGW0/SA601MJLY1P/xlYac"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 443,
    "path": "../public/assets/api-Df4qyv35.js"
  },
  "/assets/ImageUpload-Zk7bMy51.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13f6-JvSmd8LkyrzUdVMi9DHNIZBMxec"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 5110,
    "path": "../public/assets/ImageUpload-Zk7bMy51.js"
  },
  "/assets/auth-BhrcrAHN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ea-48bpQA53O7Wb71uVLd5Ln7tlvj4"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 234,
    "path": "../public/assets/auth-BhrcrAHN.js"
  },
  "/assets/auth.sign-in-CmlRknJu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-4HhnMy5lQwG4WEAY4HViIaINDno"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 185,
    "path": "../public/assets/auth.sign-in-CmlRknJu.js"
  },
  "/assets/auth.sign-up-39nJ1EPB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b9-NxsD91/NC5q97W69/csuSTcX0aU"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 185,
    "path": "../public/assets/auth.sign-up-39nJ1EPB.js"
  },
  "/assets/arrow-left-C7m3PQ5f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a6-Nz/OLk8/H42cmsFt6IdC7bIWd08"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 166,
    "path": "../public/assets/arrow-left-C7m3PQ5f.js"
  },
  "/assets/bookings-BwtOKqN0.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1fe7-pgr5rNXO2PgRCHzHJiqbwXeHYxY"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 8167,
    "path": "../public/assets/bookings-BwtOKqN0.js"
  },
  "/assets/calendar-DGhMDcJ7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"102-gBJF7HMXlrGAGPT0hrS9Ynlvw60"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 258,
    "path": "../public/assets/calendar-DGhMDcJ7.js"
  },
  "/assets/create-post-CUxjLZNC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f7c-1NTQOU9wH3NpGXYgJ8YCJipHrv4"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 3964,
    "path": "../public/assets/create-post-CUxjLZNC.js"
  },
  "/assets/button-BQAKe5sM.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"72c5-iMWzvwGsfVomep2vUZrsuVHwaTo"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 29381,
    "path": "../public/assets/button-BQAKe5sM.js"
  },
  "/assets/dashboard.index-BtMQeiHY.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e74-sIX5Ct9hf348FUdXAjDJAAstWHU"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 3700,
    "path": "../public/assets/dashboard.index-BtMQeiHY.js"
  },
  "/assets/create-service-8DPJmvn3.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1c28-turRj8ruhbEG49pWVVQHl5PgwGg"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 7208,
    "path": "../public/assets/create-service-8DPJmvn3.js"
  },
  "/assets/dollar-sign-9c2JrQNw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"dc-lwmLpIV5vNj2cwbiTAhyYF7L0ZY"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 220,
    "path": "../public/assets/dollar-sign-9c2JrQNw.js"
  },
  "/assets/discover-C0rjzLP7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1ae0-mKi7ND6FjscBUJy4e1ig6SRlr+Y"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 6880,
    "path": "../public/assets/discover-C0rjzLP7.js"
  },
  "/assets/ellipsis-vertical-D_ARX9Ke.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"e7-xWfW2ftzgXlmDHuCYVRFktiJxzw"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 231,
    "path": "../public/assets/ellipsis-vertical-D_ARX9Ke.js"
  },
  "/assets/heart-bZLsMFrj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"103-PB9JN0ToXaiNh8SliY1Cfvh43j8"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 259,
    "path": "../public/assets/heart-bZLsMFrj.js"
  },
  "/assets/index-Bj3Tc1XQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"79e-atMZkNmZpUSKmRSBIKPzx5fbMvA"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 1950,
    "path": "../public/assets/index-Bj3Tc1XQ.js"
  },
  "/assets/index-5PltJSx_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6f80a-yoJBeLqWECB4gf9sGmJQUqdAwe0"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 456714,
    "path": "../public/assets/index-5PltJSx_.js"
  },
  "/logo192.png": {
    "type": "image/png",
    "etag": '"14e3-f08taHgqf6/O2oRVTsq5tImHdQA"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 5347,
    "path": "../public/logo192.png"
  },
  "/tanstack-circle-logo.png": {
    "type": "image/png",
    "etag": '"40cab-HZ1KcYPs7tRjLe4Sd4g6CwKW+W8"',
    "mtime": "2026-01-28T10:35:28.266Z",
    "size": 265387,
    "path": "../public/tanstack-circle-logo.png"
  },
  "/assets/message-circle-B0O43-wu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"f2-TN2EllZ8giStLU2z8xc7uMRQ3a8"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 242,
    "path": "../public/assets/message-circle-B0O43-wu.js"
  },
  "/assets/index-DadhiXnJ.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"6e0a-uu+55lkQr5KQG13vwlB3I2Q1pr4"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 28170,
    "path": "../public/assets/index-DadhiXnJ.css"
  },
  "/assets/map-pin-DKGBZGve.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ff-NrmM50U+q0PzAQ0uGyY56dS/eJo"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 255,
    "path": "../public/assets/map-pin-DKGBZGve.js"
  },
  "/assets/messages-BunXPpjX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b68-dOwND0W9XkU2wHd55Qu3sScSVMA"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 2920,
    "path": "../public/assets/messages-BunXPpjX.js"
  },
  "/assets/messages._conversationId-yE_S1lbs.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"140d-wfYWMVnEJDY01aWVOsilG2r3i9o"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 5133,
    "path": "../public/assets/messages._conversationId-yE_S1lbs.js"
  },
  "/assets/plus-BlFsALoN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"9a-D3DxknMSrjBwKLBsRUO58BH1vmc"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 154,
    "path": "../public/assets/plus-BlFsALoN.js"
  },
  "/assets/post._postId-CLZtG8jC.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a2b-8GO+zrEOm8dsno1F/midpVl6NO0"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 10795,
    "path": "../public/assets/post._postId-CLZtG8jC.js"
  },
  "/assets/profile._userId-CUJz8UR4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1758-cy99Kj7x4e+qiLjUw3Y7+JzHzNQ"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 5976,
    "path": "../public/assets/profile._userId-CUJz8UR4.js"
  },
  "/assets/profile._userId.settings-DmUsZeVL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"15bc-AJHGrYNgvKEStcx0VHtBArh+JRM"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 5564,
    "path": "../public/assets/profile._userId.settings-DmUsZeVL.js"
  },
  "/assets/send-9tvlxndf.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"123-NCvK9DO0kgSx7NWH05CpHz5AKG4"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 291,
    "path": "../public/assets/send-9tvlxndf.js"
  },
  "/assets/service._serviceId-CaaQvuzA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"21c9-r0oJHknnXjFkni16gvTS/kFyW/U"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 8649,
    "path": "../public/assets/service._serviceId-CaaQvuzA.js"
  },
  "/assets/service._serviceId.edit-w8mr0ufc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"203e-nZ09s9uv65XbEWZheBwV7cfdLWc"',
    "mtime": "2026-01-28T10:35:28.524Z",
    "size": 8254,
    "path": "../public/assets/service._serviceId.edit-w8mr0ufc.js"
  }
};
function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}
const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = {
  gzip: ".gz",
  br: ".br"
};
const _6zkv1V = defineHandler((event) => {
  if (event.req.method && !METHODS.has(event.req.method)) {
    return;
  }
  let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
  let asset;
  const encodingHeader = event.req.headers.get("accept-encoding") || "";
  const encodings = [...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
  if (encodings.length > 1) {
    event.res.headers.append("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      event.res.headers.delete("Cache-Control");
      throw new HTTPError({ status: 404 });
    }
    return;
  }
  const ifNotMatch = event.req.headers.get("if-none-match") === asset.etag;
  if (ifNotMatch) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  const ifModifiedSinceH = event.req.headers.get("if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    event.res.status = 304;
    event.res.statusText = "Not Modified";
    return "";
  }
  if (asset.type) {
    event.res.headers.set("Content-Type", asset.type);
  }
  if (asset.etag && !event.res.headers.has("ETag")) {
    event.res.headers.set("ETag", asset.etag);
  }
  if (asset.mtime && !event.res.headers.has("Last-Modified")) {
    event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !event.res.headers.has("Content-Encoding")) {
    event.res.headers.set("Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !event.res.headers.has("Content-Length")) {
    event.res.headers.set("Content-Length", asset.size.toString());
  }
  return readAsset(id);
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/");
    s.length - 1;
    if (s[1] === "assets") {
      r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
    }
    return r;
  };
})();
const _lazy_iwDAtD = defineLazyEventHandler(() => Promise.resolve().then(function() {
  return rendererTemplate;
}));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_iwDAtD };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const globalMiddleware = [
  toEventHandler(_6zkv1V)
].filter(Boolean);
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function createNitroApp() {
  const hooks = void 0;
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({
          error,
          context: errorCtx
        });
      }
    }
  };
  const h3App = createH3App({ onError(error, event) {
    return errorHandler(error, event);
  } });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  const app = {
    fetch: appHandler,
    h3: h3App,
    hooks,
    captureError
  };
  return app;
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~middleware"].push(...globalMiddleware);
  {
    h3App["~getMiddleware"] = (event, route) => {
      const pathname = event.url.pathname;
      const method = event.req.method;
      const middleware = [];
      {
        const routeRules = getRouteRules(method, pathname);
        event.context.routeRules = routeRules?.routeRules;
        if (routeRules?.routeRuleMiddleware.length) {
          middleware.push(...routeRules.routeRuleMiddleware);
        }
      }
      middleware.push(...h3App["~middleware"]);
      if (route?.data?.middleware?.length) {
        middleware.push(...route.data.middleware);
      }
      return middleware;
    };
  }
  return h3App;
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  for (const rule of Object.values(routeRules)) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
  process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
  process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
const port = Number.parseInt(process.env.NITRO_PORT || process.env.PORT || "") || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const nitroApp = useNitroApp();
serve({
  port,
  hostname: host,
  tls: cert && key ? {
    cert,
    key
  } : void 0,
  fetch: nitroApp.fetch
});
trapUnhandledErrors();
const nodeServer = {};
const rendererTemplate$1 = () => new HTTPResponse('<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="icon" href="/favicon.ico" />\n    <meta name="theme-color" content="#000000" />\n    <meta\n      name="description"\n      content="Web site created using create-tsrouter-app"\n    />\n    <link rel="apple-touch-icon" href="/logo192.png" />\n    <link rel="manifest" href="/manifest.json" />\n    <title>Create TanStack App - lbf-app</title>\n    <script type="module" crossorigin src="/assets/index-5PltJSx_.js"><\/script>\n    <link rel="stylesheet" crossorigin href="/assets/index-DadhiXnJ.css">\n  </head>\n  <body>\n    <div id="app"></div>\n  </body>\n</html>\n', { headers: { "content-type": "text/html; charset=utf-8" } });
function renderIndexHTML(event) {
  return rendererTemplate$1(event.req);
}
const rendererTemplate = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  default: renderIndexHTML
});
export {
  nodeServer as default
};
