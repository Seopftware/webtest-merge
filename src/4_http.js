
goog.provide('http');

var http = {
    sendCreatedRequest: function(method, url, data, headers, callback) {
        var req = new XMLHttpRequest();

        req.onreadystatechange = function(aEvt) {
            if(req.readyState == 4){
                callback(req);
            }
        };
        req.ontimeout = function() {
            //time out error
        };

        req.open(method, url, true); //true is for Async
        req.onprogress = function (e){
            var percentComplete = (e.loaded/e.total)*100;
        };
        req.onerror = function (e){
            console.error("Error " + e.target.status + " occured while receiving the document.");
        };

        req.setRequestHeader("Content-type","text/plain");

        req.send(data);
    }
}
