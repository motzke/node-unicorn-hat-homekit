const HTTP = require("http");
const URL = require("url");
const OS = require("os");

// const local imports
const LOG = require("./log.js");
const HANDLER = require("./handler.js");
const UTILS = require("./utils.js");
const SETTINGS = require("./settings.js");


const publicApi = {
    "status": {
      "action":HANDLER.status,
      "method":["GET"]
    },
    "on": {
      "action":HANDLER.on,
      "method":["GET"]
    },
    "off": {
      "action":HANDLER.off,
      "method":["GET"]
    },
    "brightness": {
      "action":HANDLER.brightness,
      "method":["GET"]
    },
    "set": {
        "action":HANDLER.set,
        "method":["GET"]
      },

};


function start(port, host, handle) {

    const server = HTTP.createServer((request, response) => {
        response.once("finish", () => {
            LOG.access(request, response);
        });

        const urlParts = URL.parse(request.url, true);
        const pathMatch = urlParts.pathname.match(SETTINGS.BASE_URL);
        const pathName = (pathMatch && pathMatch.length >= 2) ? pathMatch[1] : null;

        //LOG.info("request", pathMatch, pathName);
        if (!handle.hasOwnProperty(pathName)) {
            LOG.error("request", "unknown api call");
            UTILS.write(response, 405, new Error("Bad Request"));
            return;
        }

        const api = handle[pathName];

        if ((api.method.indexOf(request.method) === -1 )) {
            LOG.error("request", "unsupported request method");
            UTILS.write(response, 405, new Error("Bad Request"));
            return;
        }

        if (typeof api.action != "function") {
            LOG.error("request", "unknown action");
            UTILS.write(response, 405, new Error("Bad Request"));
            return;
        }

        try {
            // LOG.debug("request", "api.action", pathName);
            api.action(request, response, urlParts);
        } catch (exception) {
            LOG.error("request", exception);
            UTILS.write(response, 500, exception);
        }
    });

    server.listen(port, host, () => {
        LOG.info("listen", OS.hostname(), ":", port);
    });
}

HANDLER.init();
start(SETTINGS.PORT, SETTINGS.IP, publicApi);
