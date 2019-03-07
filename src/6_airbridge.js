/**
 *  Airbridge 객체를 생성합니다.
*/
'use strict';

goog.provide('AirbridgeObject');

goog.require('UAParser');
goog.require('sdkConfig');
goog.require('launcher');
goog.require('utils');
goog.require('http');
goog.require('banner');
goog.require('scriptStatus');
goog.require('deeplinkObject');
goog.require('inappEvents');

 
function Airbridge() {
    this._setUA();
    this.events = new InappEvents(this);
}

Airbridge.prototype = {
    /**
     *  Set UA before init
    */
    _setUA: function() {
        /**
         *  Set client data
         */
        var transactionId = utils.getAirbridgeTid();

        this.client = {
            transactionId: transactionId,
            ua: this._parseUA() // Cutomize client ua for testing
        };

        return this.client.ua;
    },

    _fetchClientId: function(callback) {
        var self = this;
        try {
            // unique request ID, to not colide with other iframe requests.
            var requestId = 'getUUID-' + Date.now();

            // request UUID using iframe - to provide cross-domain-sharing cookies to server.
            var iframe = document.createElement('iframe');
            var iframe_src = sdkConfig.coreHost + '/webuuid/iframe.html?requestID=' + encodeURIComponent(requestId);
            if (cookie.get("ab180ClientId") !== undefined) {
                iframe_src = iframe_src + "&existingClientID=" + cookie.get("ab180ClientId");
            }
            iframe.src = iframe_src;
            iframe.style.display = 'none';

            // add message handler to catch the reply (Web UUID) from iframe.
            var replyCame = false;
            window.addEventListener('message', function replyHandler(event) {
                if (typeof event.data !== 'object' || event.data.requestID !== requestId) return;
                replyCame = true;

                // set web UUID
                self.client.clientId = event.data.reply.uuid;

                this.window.removeEventListener('message', replyHandler);
                document.body.removeChild(iframe);

                if (callback) callback();
            });

            // start loading iframe.
            document.body.appendChild(iframe);
        } catch(err) {
            console.dir(err);
            self.client.clientId = self._getClientCookie("ab180ClientId", self.client.transactionId)
            if (callback) callback();
        }
    },

    version: sdkConfig.version,

    setUserAgent: function(userAgent) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['setUserAgent', arguments]);
            return;
        }

        this.client.ua = this._parseUA(userAgent);
        return this.client.ua;
    },

    /**
     * Airbridge methods on queue that user called
    */
    taskQueue: [],

    __get_event_payload: function(channel, params, data) {
        return {
            "user": this.user,
            "device": this.device,
            "app": {
                "packageName": this.app.packageName
            },
            "browser": {
                "userAgent": navigator.userAgent,
                "clientID": this.client.clientId,
                "timezoneOffset": new Date().getTimezoneOffset()
            },
            "website": {
                "appID": this.app.appId,
                "appName": this.app['appSubdomain'],
                "siteHost": window.location.host,
                "isAirpage": this.config.airpage // websdk only
            },
            "eventData": {
                "eventCategory": data['eventCategory'],
                "sessionID": null,
                "sessionTimeOut": null,
                "exActiveStatus": null,
                "goal": data['goal'],
                "pageURL": window.location.href,
                "page": data['page'],
                "referrer": document.referrer, // 9120 필수. 바로 이전 방문한 페이지.
                "targetURL": data['targetUrl'],
                "shortID": this.simplelink.shortId,
                "trackingData": {
                    "channel": channel,
                    "params": params
                },
                "trackable": this.config.stats, // websdk only
                "transactionID": this.client.transactionId, // DEPRECATED,
                "utmParsed": this.config.utmParsed
            },
            "eventUUID": utils.getUUID(),
            "eventTimestamp": Date.now(),
            "requestTimestamp": Date.now(),
            "sdkVersion": this.config.sdkType + sdkConfig.version,
        }
    },

    /**
     * Send v2 web event
    */
    __sendWebEvent: function(data, callback) {
        if (!data.eventCategory) {
            printer.printWarning('event category is neccessary');
            return;
        }

        var eventServer = utils.getEventRequestURL(sdkConfig.webEventServer, this.app['appSubdomain'], data.eventCategory)
        var headers = null
        if (this.config.mobileApp !== undefined) {
            var osType = null
            if (this.client.ua.os.name== 'iOS') {
                osType = 'I'
            } else if (this.client.ua.os.name== 'Android') {
                osType = 'A'
            } else {
                osType = this.client.ua.os.name.toUpperCase()
            }

            this.device.deviceUUID = this.config.mobileApp.deviceUUID
            this.device.osName = this.client.ua.os.name
            this.device.osVersion = this.client.ua.os.version
            this.device.deviceModel = this.client.ua.device.model || "undefined"
            this.app.packageName = this.config.mobileApp.packageName
            this.config.sdkType = `MWA_${osType}_SDK_v` // Mobile Web App (MWA)
            if (data.eventCategory == eventCategory['goal__web']) {
                data.eventCategory = eventCategory['goal__app']
            } else {
                console.error("Not supported yet for mobileApp")
                return
            }
            eventServer = utils.getEventRequestURL(sdkConfig.mobileEventServer, this.app['appSubdomain'], data.eventCategory)
        }

        var channel = this.config.defaultChannel;
        var params = this.config.defaultParams;

        const payload = JSON.stringify(this.__get_event_payload(channel, params, data))

        http.sendCreatedRequest("POST", eventServer, payload, headers, function(res) {
            if (typeof callback === 'function') {
                if (res.status === 200) {
                    callback(null, JSON.parse(res.responseText));
                } else {
                    callback(JSON.parse(res.responseText), null);
                }
            }
            if (res.status !== 200) console.error(JSON.parse(res.responseText));
        });
    },

    // unique information of the device.
    // Provided by user, only when the SDK is running on hybrid apps.
    device: {
        deviceUUID: undefined,
        locale: navigator.language
    },
    
    // user information. Provided by user using airbridge.setUserXX.
    user: {},

    setUserAttributes: function(userAttributes) {
        if (typeof userAttributes !== 'object') throw Error('userAttributes must be a object.');
        this.user.attributes = userAttributes;
    },

    setUserId: function(userId) {
        if (typeof userId !== 'string') throw Error('userId must be a string.');
        this.user.externalUserID = userId;
    },

    setUserEmail: function(userEmail) {
        if (typeof userEmail !== 'string') throw Error('userEmail must be a string.');
        this.user.externalUserEmail = userEmail;
    },

    setUserPhone: function(userPhone) {
        if (typeof userPhone!== 'string') throw Error('userPhone must be a string.');
        this.user.externalUserPhone = userPhone;
    },

    setDeviceIFV: function(ifv) {
        if (typeof ifv !== 'string') throw Error('IFV must be a string.');
        this.device.ifv = ifv;
        if (!this.device.deviceUUID) this.device.deviceUUID = ifv;
    },

    setDeviceIFA: function(ifa) {
        if (typeof ifa !== 'string') throw Error('IFA must be a string.');
        this.device.ifa = ifa;
    },

    setDeviceGAID: function(gaid) {
        if (typeof gaid !== 'string') throw Error('GAID must be a string.');
        this.device.gaid = gaid;
        if (!this.device.deviceUUID) this.device.deviceUUID = gaid;
    },

    /**
		 * Send simplelink event
    */
    __sendSimplelinkEvent: function(data, callback) {
        if (this.config.mobileApp !== undefined) {
            printer.printWarning('Do not send V1 event when mobileApp');
            return
        }
        if (data['eventCategory'] == undefined) {
            printer.printWarning('event category is neccessary');
            return;
        }

        var channel = this.config.defaultChannel;
        var params = this.config.defaultParams;
        if (data['simplelinkData'] !== undefined && typeof data['simplelinkData'] == "object") {
            channel = data['simplelinkData']['channel'] || this.config.defaultChannel;
            params = data['simplelinkData']['params'] || this.config.defaultParams;
        }

        var simplelinkStatServer = utils.replaceAppSubdomain(sdkConfig.simplelinkStatServer, this.app['appSubdomain'])

        var v1_payload = {
            simplelinkData: {
                channel: channel,
                params: params
            },
            eventCategory: data['eventCategory'],
            stats: this.config.stats,
            targetUrl: data['targetUrl'],
            airbridgeSid: this.simplelink.shortId,
            airbridgeTid: this.client.transactionId,
            airbridgeCid: this.client.clientId,
            airpage: this.config.airpage,
            sdkVersion: this.config.sdkType + sdkConfig.version
        }
        const v2_payload = this.__get_event_payload(channel, params, data)
        const payload = Object.assign(v1_payload, v2_payload)

        http.sendCreatedRequest("POST", simplelinkStatServer,
        JSON.stringify(payload), null, function(res) {
            if (typeof callback === 'function') {
                if (res.status === 200) {
                    callback(null, JSON.parse(res.responseText));
                } else {
                    callback(JSON.parse(res.responseText), null);
                }
            }
        });
    },

    /**
     *  Redirect to webpage
    */
    sendWeb: function(targetUrl, callback) {
        this.__sendSimplelinkEvent({
            targetUrl: targetUrl,
            eventCategory: eventCategory['reach__web_to_web']
        }, callback);
    },

    /**
     *  Initilization
    */
    init: function(data, callback) {
        scriptStatus.initStarted = true;

		if (scriptStatus.initFinished) {
            if (typeof callback === "function") {
                callback(errTypes['initFinished'], null)
            }
			return;
		}

        // uninstall이 확실한 경우 통계를 쌓지않고 
        // 바로 마켓으로 이동 (조회/클릭에 대한 통계는 이전에 쌓았다고 가정)
        if (utils.isUninstalled() || this._shouldNoStats()) {
            this.config.stats = false;
        }

        // 'app' key validation
        if (data.app === undefined) {
            if (typeof callback === "function") {
                callback(errTypes['appNameRequired'], null)
            }
            return;
        }

        // 'appToken' key validation
        if (data.appToken === undefined) {
            if (typeof callback === "function") {
                callback(errTypes['appTokenRequired'], null)
            }
            return;
        }

        // Preset simplelink id
        if (data.simplelinkId !== undefined) {
            this.simplelink.shortId = data.simplelinkId;
        }

        // Preset channel
        if (utils.isExisty(data.defaultChannel)) {
            this.config.defaultChannel = data.defaultChannel;
        }

        // Preset params
        if (data.defaultParams !== undefined && typeof data.defaultParams === "object") {
            this.config.defaultParams = data.defaultParams;
        }

        // Set whether track ad or not
        if (data.adTrack !== undefined) {
            this.config.adTrack = data.adTrack;
        }

        // Set whether airpage or not
        if (data.airpage !== undefined) {
            this.config.airpage = data.airpage;
        }

        // Set stats
        if (data.stats !== undefined) {
            this.config.stats = data.stats;
        }

        // Set download buttons ids
        if (data.downloadButtonIds !== undefined && typeof data.downloadButtonIds === "object") {
            this.config.downloadButtonIds = data.downloadButtonIds;
        }

        if (data.utmParsing !== undefined) {
            this.config.utmParsing = data.utmParsing;
        }

        if (data.cookieWindow !== undefined) {
            this.config.cookieWindow = data.cookieWindow;
        }

        if (data.cookieWindowInMinutes !== undefined) {
            this.config.cookieWindowInMinutes = data.cookieWindowInMinutes;
        }

        if (data.urlQueryMapping !== undefined) {
            this.config.urlQueryMapping = data.urlQueryMapping;
        }

        if (data.shareCookieSubdomain !== undefined) {
            this.config.shareCookieSubdomain = data.shareCookieSubdomain;
        }

        if (data.mobileApp !== undefined) {
            if (!utils.isExisty(data.mobileApp.deviceUUID) || !utils.isExisty(data.mobileApp.packageName)) {
                console.error("There is no required value of mobileApp");
                return
            }
            this.config.mobileApp = data.mobileApp
            this.device.deviceUUID = data.mobileApp.deviceUUID
            this.device.packageName = data.mobileApp.packageName
        }

        const self = this;
        this._fetchClientId(() => {
            printer.printConsole("Client ID: " + self.client.clientId + " is set.");

            // Request url 만들기
            var template = data['deeplinkTemplate'] || data['template'];
            var requestUrl = utils.replaceAppSubdomain(sdkConfig.appDataServer, data['app']);
            if (data.appToken !== undefined) {
                requestUrl = utils.addParameterToURL(requestUrl, 'appToken='+data.appToken);
                self.app.appToken = data.appToken;
            }
            if (template !== undefined) {
                requestUrl = utils.addParameterToURL(requestUrl,  'tpl=' + template);
            }

            http.sendCreatedRequest("GET", requestUrl, null, null, function(res) {
                try {
                    if (res.status === 200) {
                        printer.printConsole("서버에서 성공적으로 데이터를 받아왔습니다. (init)");

                        // app 데이터 할당
                        var data = JSON.parse(res.responseText);
                        self.app.appSubdomain = data['appSubdomain'];
                        self.app.appId = data['appId'];
                        self.app.iOSMarket = data['iosMarket'];
                        self.app.androidMarket = data['androidMarket'];
                        self.app.webLanding = data['webLanding'];
                        self.app.appIconImageUrl = data['appIconImageUrl'];

                        // deeplink template init에서 한번에 받아올 것
                        self.deeplink.template = template;
                        self.deeplink.iOSRaw = data['template']['iosRaw'];
                        self.deeplink.webRaw = data['template']['webRaw'];
                        self.deeplink.androidRaw = data['template']['androidRaw'];

                        // Set script status to initilized (initialize finished)
                        // Must be exist before executing taskQueue
                        scriptStatus.initFinished = true;

                        // 실제 기능이 작동하도록 standby
                        self._standby();

                        // init 뒤에 처리해야 할 queue에 있는 작업 처리
                        if (window && window.airbridge && window.airbridge.queue instanceof Array) {
                            const queue = window.airbridge.queue;

                            queue.filter(([name]) => name !== 'init').forEach(([name, params]) => {
                                try {
                                    if (~name.indexOf('.')) {
                                        // sub-object를 호출한다. (ex: airbridge.events.signIn)
                                        const [objName, methodName] = name.split('.');
                                        self[objName][methodName].apply(self[objName], params);
                                    }
                                    else self[name].apply(self, params);

                                } catch (err) {
                                    printer.printWarning(`Failed to call airbridge.${name}`);
                                    console.dir(err);
                                }
                            });

                            // replace global "airbridge" from holder to real instance.
                            window.airbridge = self;
                        }
                        self.taskQueue = [];

                        // 조회 통계를 보냅니다.
                        // callback에서 short id를 조작하게 하려면 통계가 여기 있어야함
                        self.__sendSimplelinkEvent({
                            eventCategory: eventCategory['view__web']
                        }, function(err, res) {
                            if (res !== null) {
                                try {
                                    self._setShortIDWithShortURL(res.simpleLink);
                                } catch (err) {
                                }
                            }
                            // init이 모두 종료된 후 callback
                            if (typeof callback === "function")
                                callback(null, self);
                        });

                        // uninstall이 확실한 경우 통계를 쌓지않고
                        // 바로 마켓으로 이동 (조회/클릭에 대한 통계는 이전에 쌓았다고 가정)
                        if (utils.isUninstalled()) {
                            self.goDownload({});
                        }
                    } else {
                        if (res.status === 400) {
                            printer.printWarning(JSON.parse(res.responseText).hint);
                        } else if (res.status === 404) {
                            printer.printWarning("앱을 찾을 수 없습니다. 다시 한 번 확인해주세요.");
                        } else if (res.status === 500) {
                            printer.printWarning("서버에 장애가 발생했습니다. http://status.airbridge.io를 확인해보세요.");
                        } else {
                            printer.printWarning("데이터를 받아올 수 없습니다. (Response Code: " + res.status + ")");
                        }

                        // init이 모두 종료된 후 callback
                        if (typeof callback === "function")
                            callback(res, null);
                    }
                } catch(err) {
                    printer.printWarning('Failed');
                    console.dir(err);
                }
            });
        });
    },

    /**
    *  Data about application
    *
    *  Need to be filled with 'init'
    */
    app: {
        appSubdomain: null,
        appIconImageUrl: null,
        appId: null,
        iOSMarket: null,
        androidMarket: null,
        webLanding: null,
        appToken: null,
        packageName: undefined
    },

    /**
     *  Deeplink template
    */
    deeplink: {
        template: undefined,
        iOSRaw: undefined,
        androidRaw: undefined,
        webRaw: undefined
    },

    /**
     *  Simplelink data (stat)
    */
    simplelink: {
        //channel: '',
        //campaign: '',
        //medium: '',
        //term: '',
        content: '',
        shortId: ''
    },

    /**
     *  Download Configurations
    */

    /**
     *  Configurations
    */
    config: {
        defaultChannel: 'airbridge.websdk',
        defaultParams: {},
        downloadButtonIds: [],
        downloadButtonNames: {},
        airpage: false,
        adTrack: true,
        stats: true,
        cookieWindow: 3, // days
        cookieWindowInMinutes: undefined, // minutes
        utmParsing: false,
        utmParsed: false,
        urlQueryMapping: undefined,
        shareCookieSubdomain: false,
        mobileApp: undefined,
        sdkType: 'W_SDK_v'
    },

    /**
     *  Airbridge standby
    */
    _standby: function() {
        /**
        *  Parsing ad parameters
        *  shortId가 미리 설정되어 있으면 query parsing을 하지 않음
        */
        if (!utils.isExisty(this.simplelink.shortId) && this.config.adTrack) {
            this._retQuery();
        }

        this._setDownloadButtons(this.config.downloadButtonIds);
    },

    /**
     * @private 테스트에만 사용됨. SDK 상태를 초기화한다.
     */
    _reset() {
        scriptStatus.initStarted = scriptStatus.initFinished = false;
    },

    /**
     *  Banner both on mobile and desktop
    */
    setBanner: function(customConfig) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['setBanner', arguments]);
            return;
        }

        banner.createBanner(this.client.ua.platform, this.app, customConfig, {
            goDownload: this.goDownload,
            sendSMS: this.sendSMS
        }, this);
    },

    /**
     *  4000: type이 잘못됨
     *  4001: 번호 입력 안함
     *  4002: 유효하지 않은 번호
     *  4003: 메시지 보내는 중
     *  4004: 문자 모두 이용
     *  4005: 서버 장애
    */
    sendSMS: function(data, callback) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['sendSMS', arguments]);
            return;
        }

        // TODO
        var self = this;
        var phoneNum = data['phoneNum'];
        var message = data['message'];

        if (phoneNum == undefined) {
            if (typeof callback === "function")
                callback(errTypes['requiredFieldEmpty']('phoneNum'), null);
            return;
        } else if(phoneNum.trim()==="") {
            if (typeof callback === "function")
                callback(errTypes['phoneNumRequired'], null);
            return;
        }

        /**
         *  dash(-) 제거
        */
        phoneNum = phoneNum.split('-').join('')
        if (!utils.isValidPhoneNumber(phoneNum)) {
            if (typeof callback === "function")
                callback(errTypes['wrongPhoneNumbers'], null);
            return;
        }

        // #,/.. Validation
        var channel = data['channel'] || this.config.defaultChannel;
        var params = data['params'] || {};
        var simplelink = data['url'] || data['simplelink'] || utils.getSimplelinkFormatWithShortId(this.simplelink.shortId);

        // Send both sms and stats
        http.sendCreatedRequest("POST", sdkConfig.smsServer, JSON.stringify({
            type: 1002,
            phoneNum: phoneNum,
            customMessage: message,
            appToken: self.app.appToken,
            appSubdomain: self.app.appSubdomain,
            clientId: self.client.clientId,
            transactionId: self.client.transactionId,
            simplelink: simplelink,
            simplelinkData: {
                channel: channel,
                params: params
            }
        }), null,
        function(res) {
            if (typeof callback === "function") {
                if (res.status == 200) {
                    self.__sendSimplelinkEvent({
                        eventCategory: eventCategory['reach__web_to_sms']
                    })
                    callback(null, JSON.parse(res.response));
                } else {
                    callback(JSON.parse(res.response), null);
                }
            }
        });
    },

    setDeeplinks: function(data, callback) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['setDeeplinks', arguments]);
            return;
        }

        var deeplinkObject = new DeeplinkObject(this);

        deeplinkObject.setConfig({
            deeplinks: data['deeplinks'],
            redirect: data['redirect'],  // default false.  (true: automatically redirect user to app page or store)
            webPopup: data['desktopPopUp'], // default false. (true: for desktop user, new browser will launch.)
            test: data['test'],     // default false. (true: you can see console log.)
            buttonId: data['buttonID'],
            fallbacks: data['fallbacks'],
            actualRedirect: data['actualRedirect'],
            usePlayStoreDeferred: data['usePlayStoreDeferred'],
            callbackAfterLoad: callback
        });

        deeplinkObject.exec();
    },

    /**
     *  버튼 하나하나 Deeplink 속성 설정
    */
    setDeeplink: function(data, callback) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['setDeeplink', arguments]);
            return;
        }

        if (!utils.isExisty(this.deeplink.template)) {
            printer.printWarning("deeplink template이 없습니다.");
            return;
        }

        var deeplinkObject = new DeeplinkObject(this);

        deeplinkObject.setConfig({
            indicies: data['indicies'],
            redirect: data['redirect'],  // default false.  (true: automatically redirect user to app page or store)
            webPopup: data['webPopup'], // default false. (true: for desktop user, new browser will launch.)
            test: data['test'],     // default false. (true: you can see console log.)
            buttonId: data['buttonId'],
            linkData: data['linkData'],
            actualRedirect: data['actualRedirect'],
            callbackAfterLoad: callback,
            version: 1.0
        });

        deeplinkObject.exec();
    },

    /**
     *  버튼 하나하나 다운로드 속성 설정
    */
    setDownload: function(data, callback) {
        if (!scriptStatus.initFinished) {
            this.taskQueue.push(['setDownload', arguments]);
            return;
        }

        var self = this;

        if (data.buttonID !== undefined) {
            data.buttonId = data.buttonID
        }

        if (data.buttonId !== undefined && typeof data.buttonId === 'string') {
            var button = document.getElementById(data.buttonId);
            if (!button) return;

            button.onclick = function() {
                self.goDownload(data, callback);
            };
        } else if (data.buttonId !== undefined && typeof data.buttonId === 'object') {
            this._setDownloadButtons(data.buttonId, callback)
        }
    },

    _setDownloadButtons: function(buttons, callback) {
        var self = this;
        for (var i=0; i<buttons.length; i++) {
            var button = document.getElementById(buttons[i]);
            if (!button) continue;

            printer.printConsole(`_setDownloadButtons: '${buttons[i]}' can be clicked.`);
            button.onclick = function() {
                self.simplelink.content = this.id;
                self.goDownload({
                    'channel': self.config.defaultChannel,
                    'params': {
                        'content': self._getContent()
                    }
                }, callback);
            };
        }
    },

    /**
     *  Download 링크로 Routing
    */
    goDownload: function(data, callback) {
        if (data === undefined) data = {};

		var self = this;
        // iOS Market이나 Android Market으로 이동해야함 (Desktop의 경우 Android로 이동..)
        this.__sendSimplelinkEvent({
            // 중요: 디바이스 및 마켓 주소 존재 여부를 서버에서 판단하여 알려주기 때문에
            // eventCategory를 미리 정할 수 없음. reach__web_to_android_market은 상징적인 의미.
            eventCategory: eventCategory['reach__web_to_android_market'],
            simplelinkData: {
                channel: data['channel'] || this.config.defaultChannel,
                params: data['params']
            }
        }, function(err, res) {
            if (typeof callback == 'function') {
                callback(err, res)
            } else {
                self.launchStore(res.targetUrl);
            }
        });
    },

    /**
     *  download button 이름이 있으면 이름을 받아오고 없으면 id를 받아옴
    */
    _getContent: function() {
        return this.config.downloadButtonNames[this.simplelink.content]?
            this.config.downloadButtonNames[this.simplelink.content]:this.simplelink.content;
    },

    /**
    *  Launch store.
    */
    launchStore: function(targetUrl) {
        printer.printConsole("launchStore is called.");

        var marketUrl = "";
        switch (this.client.ua.platform) {
            case 'iOS':
                marketUrl = utils.isExisty(targetUrl)? targetUrl:this.app.iOSMarket;
                launcher.replaceLaunch(marketUrl);
                break;
            case 'Android':
                marketUrl = utils.isExisty(targetUrl)? targetUrl:this.app.androidMarket;
                launcher.replaceLaunch(marketUrl);
                break;
            default:
                // Desktop에선 안드로이드 마켓이 우선
                marketUrl = utils.isExisty(targetUrl)? targetUrl:(this._createHttpMarketUrl(this.app.androidMarket) || this._createHttpMarketUrl(this.app.iOSMarket));
                launcher.hrefLaunch(marketUrl);
                break;
        }

        return marketUrl;
    },

    /**
     *  Make market deeplink to http url.
     */
    _createHttpMarketUrl: function(marketUrl) {
        return marketUrl.replace("market://", "https://play.google.com/store/apps/").replace("itms-app://","https://");
    },

    /**
     *  Parse ua string and set client ua.
     *
     *  @param {string} uaString - if undefined, then navigator.userAgent as default value.
     *  @return {object}
     */
    _parseUA: function(uaString) {
        /**
         *  Parse UA.
         */
        var ua = new UAParser(uaString).getResult();

        switch (ua.os.name) {
            case 'iOS':
                ua.platform = 'iOS';
                break;
            case 'Android':
                ua.platform = 'Android';
                break;
            default:
                ua.platform = 'Web';
        }

        return ua;
    },


    /**
    * Set clientId on browser
    */
    _getClientCookie: function(cookieId, uuid) {
        var clientId = cookie.get(cookieId);

        if(clientId === undefined){
            clientId = uuid;
            cookie.set(cookieId, clientId, 30, this.config.cookieWindowInMinutes, this.config.shareCookieSubdomain);
        }

        return clientId;
    },

    /**
     *  식별할 수 있는 광고 쿼리는 변수와 쿠키에 저장합니다.
    */
    _retQuery: function() {
        // 현재 쿼리 스트링을 받아서 있으면, 광고용 파라미터인지 확인하고, 쿠키에 저장(72시간)한다.
        var query = utils.queryStringToJSON(window.location);

        // 심플링크 ID를 받아옵니다.
        if (query['airbridge_referrer'] !== undefined) {
            var referrerQuery = utils.splitQueryStringToJSON(query['airbridge_referrer']);
            var shortID = referrerQuery['short_id'] || referrerQuery['airbridge_sid'] || query['short_id'] || query['airbridge_sid'];
            var clientID = referrerQuery['client_id'] || referrerQuery['airbridge_cid'] || referrerQuery['transaction_id'] || query['client_id'] || query['airbridge_cid'] || query['transaction_id'];
            if (shortID !== undefined) {
                this._setShortID(shortID);
            }
            if (clientID !== undefined) {
                this._setClientID(clientID);
            }
        } else if (this.config.utmParsing && utils.isExisty(query['utm_source'])) {
            this._setUTMParams(query);
            cookie.set('airbridge_utm', window.location, this.config.cookieWindow, this.config.cookieInMinutes, this.config.shareCookieSubdomain);
            this._setShortID('');
        } else if (query['airbridge_sid'] !== undefined) {
            this._setShortID(query['airbridge_sid']);
        } else if (cookie.get('airbridge_sid') !== undefined) {
            this.simplelink.shortId = cookie.get('airbridge_sid');
        } else if (cookie.get('airbridge_utm') !== undefined) {
            var url = decodeURIComponent(cookie.get('airbridge_utm'))
            this._setUTMParams(utils.queryStringToJSON(url));
        }

        if (this.config.urlQueryMapping !== undefined) {
            for (var key in this.config.urlQueryMapping) {
                if (typeof this.config.urlQueryMapping[key] == 'string') {
                    var queryKey = this.config.urlQueryMapping[key];
                    if (utils.isExisty(query[queryKey])) {
                        if (key == 'channel') {
                            this.config.defaultChannel = query[queryKey];
                        } else {
                            this.config.defaultParams[key] = query[queryKey];
                        }
                    }
                } else if (typeof this.config.urlQueryMapping[key] == 'object') {
                    for (var subidx in this.config.urlQueryMapping[key]) {
                        var queryKey = this.config.urlQueryMapping[key][subidx];
                        if (utils.isExisty(query[queryKey])) {
                            if (key == 'channel') {
                                this.config.defaultChannel = query[queryKey];
                            } else {
                                this.config.defaultParams[key] = query[queryKey];
                            }
                            break;
                        }
                    }
                }
            }
        }
    },

    _setUTMParams: function(query) {
        this.config.defaultChannel = query['utm_source']
        this.config.defaultParams = {
            medium: query['utm_medium'],
            campaign: query['utm_campaign'],
            term: query['utm_term'],
            content: query['utm_content']
        }
        this.config.utmParsed = true;
    },

    _setClientID: function(clientID) {
        this.client.clientId = clientID;
        cookie.set('ab180ClientId', clientID, 30, this.config.cookieWindowInMinutes, this.config.shareCookieSubdomain);
    },

    _setShortIDWithShortURL(shortURL) {
        if (shortURL !== undefined && shortURL.split('/').length > 1) {
            var preshortID = cookie.get("airbridge_sid");
            var shortID = shortURL.split('/').pop();

            if(shortID !== preshortID) {
                this._setShortID(shortID);
            }
        }
    },
    _setShortID: function(shortID) {
        this.simplelink.shortId = shortID;
        cookie.set('airbridge_sid', shortID, this.config.cookieWindow, this.config.cookieWindowInMinutes, this.config.shareCookieSubdomain);
    },

    /**
     *  식별할 수 있는 광고
    */
    _isConfiguableAds: function(query) {
        if (query['n_campaign'] !== undefined && query['n_ad_group'] !== undefined && query['n_keyword']) {
            return true;
        } else if (query['utm_source'] !== undefined && query['utm_campaign'] !== undefined) {
            return true;
        } else {
            return false;
        }
    },

    _shouldNoStats: function() {
        var query = utils.queryStringToJSON(window.location);

        if (query['deferred_web_stat'] !== undefined || query['https_deeplink'] !== undefined) {
            return true;
        } else {
            return false; 
        }
    }
};
