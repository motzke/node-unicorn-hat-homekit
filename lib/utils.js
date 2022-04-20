function write(response, code, message, header) {

    message = (message || (typeof message === "string" ? "" : {}));
    header = (header || {"Access-Control-Allow-Origin": "*"});

    if (!header["Content-Type"]) {
        header["Content-Type"] = "application/json;charset=utf-8"
    }

    if (typeof message === "object") {
        message = JSON.stringify(message, (key, value) => {
            return (value === "") ? undefined : value;
        });
    }

    header["Content-Length"] = Buffer.byteLength(message, "utf8");

    if (response && ! response.finished){
        response.writeHead(code, header);
        response.write(message);
        response.end();
    } else {
        console.error("write", "response not avaiable", code, header, message);
    }
};
exports.write = write;