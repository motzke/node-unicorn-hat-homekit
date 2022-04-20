
function log(level, args) {
    var message = [].slice.call(args);
    message.forEach((o, i, a) => a[i] = ((o instanceof Error) ? o.message : o));

    console.error(level, message);
};

function isStatusError(sc) {
    return (typeof sc == "number" && 400 <= sc && 600 > sc);
}

function error() {
    log('error', arguments);
};
function info() {
    log('info', arguments);
};
function warn() {
    log('warn', arguments);
};
function debug() {
    log('debug', arguments);
};
function access(req, resp) {
    var level = (isStatusError(resp.statusCode) ? 'error' : 'notice');
    var message = `${req.connection.remoteAddress ? req.connection.remoteAddress : "-"} \"${req.method} ${req.url}\" ${resp.statusCode} ${req.headers['referer'] ? req.headers['referer'] : "-"}`;
    log(level, [message]);
}

exports.error = error;
exports.info = info;
exports.warn = warn;
exports.debug = debug;
exports.access = access;