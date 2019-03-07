/**
 * script가 로드되기 전에 queue에 들어간 task를 꺼내서 처리합니다.
 */
'use strict';

goog.provide('airbridge_instance');
goog.require('AirbridgeObject');
goog.require('utils');
goog.require('scriptStatus');

if (window && window.airbridge && window.airbridge.queue instanceof Array) {
    const airbridgeInstance = new Airbridge();

    // Init을 호출한다.
    const queue = window.airbridge.queue;
    if (queue.length > 0 && queue[0][0] === 'init') {
        airbridgeInstance.init(...queue[0][1]);
    }

    if ((!scriptStatus.initStarted) && queue.length >= 1) {
        printer.printWarning("init should be called before any other functions");
    }
}
