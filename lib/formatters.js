function formatJSON(req, res, body) {
        if (body instanceof Error) {
                // snoop for RestError or HttpError, but don't rely on
                // instanceof
                res.statusCode = body.statusCode || body.status || 500;
        } else if (Buffer.isBuffer(body)) {
                body = body.toString('base64');
        }

        var data = JSON.stringify(body, null, 4);
        res.setHeader('Content-Length', Buffer.byteLength(data));

        return (data);
}

module.exports.formatJSON = formatJSON;
