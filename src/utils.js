export function extend(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
        if (!arguments[i])
            continue;
        for (var key in arguments[i]) {
            if (arguments[i].hasOwnProperty(key))
                out[key] = arguments[i][key];
        }
    }
    return out;
};


export function ajax_get(url, success_callback, error_callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            success_callback(request.responseText);
        } else {
            error_callback();
        }
    };

    request.onerror = function() {
        throw "Connection Error for ajax get request";
    };

    request.send();
}
