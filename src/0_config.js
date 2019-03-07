goog.provide('scriptStatus');

goog.require('sdkConfig');

/**
 *  Script 상태에 대한 변수들입니다.
*/
scriptStatus = {};
scriptStatus.initStarted = false;
scriptStatus.initFinished = false;

/**
 *  SDK config를 설정합니다.
*/
sdkConfig.version = "1.7.14";
sdkConfig.appDataServer = sdkConfig.sdkHost + '/data/'+sdkConfig.version+'/{{appSubdomain}}';
sdkConfig.simplelinkStatServer= sdkConfig.sdkHost + "/api/v1/apps/{{appSubdomain}}/stats";
sdkConfig.deeplinkStatServer = sdkConfig.coreHost + '/api/v1/apps/{{appSubdomain}}/stats';
sdkConfig.smsServer= sdkConfig.coreHost + "/api/message";
sdkConfig.webEventServer = sdkConfig.coreHost + "/api/v2/apps/{{appSubdomain}}/events/web/{{eventCategory}}";
sdkConfig.mobileEventServer = sdkConfig.coreHost + "/api/v2/apps/{{appSubdomain}}/events/mobile-webapp/{{eventCategory}}";
