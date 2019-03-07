/**
 * @desc
 * 에어브릿지 WEB SDK는 사용자를 웹에서(1)앱 페이지 혹은
 * (2)마켓/스토어로 매끄럽게 이동시킵니다.
 *
 * 1. 사용자 UA 정보를 Parsing 합니다.
 * 2. 앱 런칭을 시도합니다.
 * 3. 앱 런칭 실패시 앱 스토어를 엽니다.
 * 4. 그 과정에서 통계를 쌓습니다.
 *
 * var ab = new Airbridge();
 * ab.setConfig({
 *  //...
 * });
 * ab.exec();
 *
 * @author Hunjae Jung
*/
goog.provide('deeplinkObject');

goog.require('sdkConfig');
goog.require('utils');

function DeeplinkObject(airbridge) {
    /**
     *  Set raw deeplink template
    */
    this.app.template = airbridge.deeplink.template;
    this.app.iOSDeeplink = airbridge.deeplink.iOSRaw;
    this.app.androidDeeplink = airbridge.deeplink.androidRaw;
    this.app.webDeeplink = airbridge.deeplink.webRaw;

    /**
     *  Set app information
    */
    this.app.appId = airbridge.app.appId.toString();
    this.app.iOSMarket = airbridge.app.iOSMarket;
    this.app.androidMarket = airbridge.app.androidMarket;
    this.app.webLanding = airbridge.app.webLanding;

    /**
     *  Set sdk information
    */
    this.sdk.statServer = sdkConfig.deeplinkStatServer.replace('{{appSubdomain}}', airbridge.app.appSubdomain);
    this.sdk.version = sdkConfig.version;

    /**
     *  Set send event function
    */
    this.airbridge = airbridge;

    this.init();
}

DeeplinkObject.prototype = {
    /**
     *  constructor
    */
    init: function() {
        /**
         *  Initialize test object.
        */
        this.test = {};

        /**
         *  Set client data
         */
        this.client = utils.clone(this.airbridge.client);
        this.client.resolution = {width: window.screen.width, height: window.screen.height};
        this.client.resultFunctionality = 0;
        this.client.completeDeeplink = this._getTargetDeeplink();
        this.client.originalDeeplink = this.client.completeDeeplink;
        this.client.completeFallback = "";

        return this.client.ua;
    },

    /**
     *  Parse ua string and set client ua.
     *
     *  @param {string} uaString - if undefined, then navigator.userAgent as default value.
     *  @return {object}
    */
    parseUA: function(uaString) {
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

        return this.client.ua = ua
    },

    updateCompleteDeeplink: function() {

    },

    /**
     *  For test.
    */
    test: {
        launcher: "",
		executeUrl: ""
    },

    /**
     *  Information about this sdk.
    */
    sdk: {
        version: undefined,
        statServer: undefined,
        androidTimeout: 800,
        iOSTimeout: 2001
    },

    /**
     *  Data about application.
    */
    app: {
        appId: undefined,
        //linkId: undefined,
        iOSMarket: undefined,
        androidMarket: undefined,
        template: undefined,
        iOSDeeplink: undefined,
        androidDeeplink: undefined,
        webDeeplink: undefined,
        webLanding: undefined,
        sdkFlag: true
    },

    /**
     *  Configurations.
    */
    config: {
        deeplinks: {},
        fallbacks: {
            ios: "itunes-appstore",
            android: "google-play"
        },
        version: 2.0,
        usePlayStoreDeferred: false,
        indicies: {},
        actualRedirect: true,
        redirect: false,
        label: "",
        stats: true,
        sms: false,
        storeOnly: true,
        buttonId: [],
        descId: [],
        language: "ko",
        webRedirect: false,
        webPopup: false,
        test: false,
        linkData: {
            channel: null,
            params: {},
            title: null,
            description: null,
            imageUrl: null
        },
        callbackAfterLoad: function() {

        },
        isNotSupportedFallbackURL: false
    },

    finalValue: {
        deeplink: null,
        fallback: null,
        webFallback: "",
        airbridgeReferrer: null,
    },

    /**
     *  For callback timer.
    */
	TIMEOUT: {
        IOS_SHORT: 1000,
        IOS_LONG: 1000 * 2,
        ANDROID: 800,
        INTERVAL: 100
    },

    /**
     *  Apply indicies on raw deeplink.
     *
     *  @param {object} indicies - ios, android, web indicies
     *  @return {string} - complete deeplink with sdk parameters
    */
    applyConfigIndicies: function(requiredParams, indicies) {
        var warnFlag = false;

        for (var i=0; i<requiredParams.length; i++) {
            if (!indicies[this.client.ua.platform.toLowerCase()].hasOwnProperty(requiredParams[i])) {
                this.printWarning(this.client.ua.platform.toLowerCase() + " indicies에 " + requiredParams[i] + "가 필요합니다.");
                warnFlag = true;
            }
        }

        if (warnFlag == false) {
            return this._setSDKParams(this._setIndiciesOnRawDeeplink(indicies, this.client.completeDeeplink, this.client.ua.platform.toLowerCase()));
        } else {
            return this._getTargetDeeplink();
        }
    },

    /**
     *  Set configurations.
    */
    setConfig: function(config) {
        this.config = {
            usePlayStoreDeferred: config.usePlayStoreDeferred===undefined? this.config.usePlayStoreDeferred:config.usePlayStoreDeferred,
            version: config.version===undefined? this.config.version:config.version,
            deeplinks: config.deeplinks===undefined? this.config.deeplinks:config.deeplinks,
            fallbacks: config.fallbacks===undefined? this.config.fallbacks:config.fallbacks,
            indicies: config.indicies===undefined? this.config.indicies:config.indicies,
            redirect: config.redirect===undefined? this.config.redirect:config.redirect,
            label: config.label===undefined? this.config.label:config.label,
            webRedirect: config.webRedirect===undefined? this.config.webRedirect:config.webRedirect,
            webPopup: config.webPopup===undefined? this.config.webPopup:config.webPopup,
            stats: config.stats===undefined? this.config.stats:config.stats,
            actualRedirect: config.actualRedirect===undefined? this.config.actualRedirect:config.actualRedirect,
            sms: config.sms===undefined? this.config.sms:config.sms,
            buttonId: config.buttonId? [].concat(config.buttonId):this.config.buttonId,
            descId: config.descId? [].concat(config.descId):this.config.descId,
            language: config.language===undefined?  this.config.language:config.language,
            test: config.test===undefined?  this.config.test:config.test,
            linkData: config.linkData===undefined? this.config.linkData:config.linkData,
            callbackAfterLoad: config.callbackAfterLoad===undefined? this.config.callbackAfterLoad:config.callbackAfterLoad
        }

        // indicies가 있고, 필요할 때
        var requiredParams = this._getRequiredParams(this._getTargetDeeplink());
        if (requiredParams.length != 0 && config.indicies && config.indicies.hasOwnProperty(this.client.ua.platform.toLowerCase())) {
            // Need to update.
            this.client.completeDeeplink = this.applyConfigIndicies(requiredParams, config.indicies);
            this.client.originalDeeplink = this.client.completeDeeplink
        } else {
            this.client.completeDeeplink = this._getTargetDeeplink();
            this.client.originalDeeplink = this.client.completeDeeplink
        }

        return this.config
    },

    /**
     *  Get configurations.
    */
    getConfig: function() {
        return this.config;
    },

    /**
     *  Check whether it is http protocol or not.
    */
    _isHTTP: function(url) {
        if (this._getParser(url).protocol == "http:" || this._getParser(url).protocol == "https:")
            return true
        else
            return false
    },


    /**
     *  Check whether it is intent protocol or not.
    */
    _isIntent: function(deeplink) {
        if (this._getParser(deeplink).protocol == "intent:")
            return true
        else
            return false
    },

    /**
     *  Get a tag wrapped parser.
    */
    _getParser: function(url) {
        var parser = document.createElement('a');
        parser.href = url;
        return parser
    },

    _setHTTPForNoProtocolUrl: function(url) {
        if (utils.isExisty(url) && url.indexOf("://") == -1 ) {
            return "http://" + url;
        } else {
            return url;
        }
    },

    /**
     *  Get target deeplink with proper process.
    */
    _getTargetDeeplink: function() {
        if (utils.isExisty(this.config.deeplinks['ios']))
            this.app.iOSDeeplink = this.config.deeplinks['ios'];
        if (utils.isExisty(this.config.deeplinks['android']))
            this.app.androidDeeplink = this.config.deeplinks['android'];
        if (utils.isExisty(this.config.deeplinks['desktop']))
            this.app.webDeeplink = this.config.deeplinks['desktop'];

        switch (this.client.ua.os.name) {
            case 'iOS':
                return this.app.iOSDeeplink;
            case 'Android':
                return this.app.androidDeeplink;
            default:
                return this._setHTTPForNoProtocolUrl(this.app.webDeeplink) || this.app.webLanding;
        }
    },

    /**
     *  Check completeDeeplink is android intent or iOS universal link.
    */
    _haveToTryStore: function() {
        if (!this.isMobile()) {
            return false;
        } else if (this._isIntent(this.client.completeDeeplink) || this._isiOSUniversal(this.client.completeDeeplink)) {
            return false;
        } else {
            return true;
        }
    },

    /**
     *  TODO
     *  Check whether using iOS 9 Universal Link.
    */
    _isiOSUniversal: function() {
        return false;
    },

    /**
     *  Check the browser support android intent filter.
    */
    _isIntentSupport: function() {
        var intentlessBrowsers = [
            'firefox',
            'opr',
            'kakaotalk',
            'naver'
        ];
        var blackListRegexp = new RegExp(intentlessBrowsers.join('|'), 'i');
        return !blackListRegexp.test(this.client.ua.ua.toLowerCase());
    },

    _getMarketDeeplink: function(deeplink, market) {
        var deeplinkParser = this._getParser(deeplink);
        var marketParser = this._getParser(market);
        var referrer = ""
        try {
            if (deeplinkParser.search.indexOf("airbridge_referrer=") != -1) {
                referrer = "&referrer=" + deeplinkParser.search.split("airbridge_referrer=")[1]
            }
        } catch(err) {
        }
        var finalUrl = "market://details?id=" + marketParser.search.replace("?id=", "") + referrer + "&url=" + encodeURIComponent(deeplinkParser.protocol + '//' + deeplinkParser.pathname.replace(/\/\//g, '') + deeplinkParser.search);

        return finalUrl;
    },

    _isFallbackSupported: function() {
        var SCHEME_FOR_TEST = 'intent://open#Intent;scheme=;end';

        //.... "S.browser_fallback_url"이 지원되는지 확인한다.
        var iframe = document.createElement('IFRAME'),
            self = this;

        iframe.style.display = 'none';
        iframe.addEventListener('load', function onload() {
            if (iframe.src === SCHEME_FOR_TEST) {
                self.config.isNotSupportedFallbackURL = true;
            } else {
                self.config.isNotSupportedFallbackURL = false;
                iframe.removeEventListener('load', onload);
                document.body.removeChild(iframe);
            }
        });
        iframe.src = SCHEME_FOR_TEST;

        document.body.appendChild(iframe);
        setTimeout(function() {
            iframe.src = '';
        }, 100);
    },

    /**
     *  Change deeplink to intent filter.
    */
    _getIntent: function(deeplink, market) {
        var deeplinkParser = this._getParser(deeplink);
        var marketParser = this._getParser(market);

        var finalUrl = "intent://" + deeplinkParser.pathname.replace(/\/\//g, '') + deeplinkParser.search + "#Intent;scheme=" + deeplinkParser.protocol.replace(':', '') + ";package=" + marketParser.search.replace("?id=", "")
        this._isFallbackSupported();

        if (utils.isExisty(this.finalValue.webFallback) && this.finalValue.webFallback.indexOf("http") != -1 && !this.config.isNotSupportedFallbackURL) {
            finalUrl = finalUrl + ";S.browser_fallback_url=" + encodeURIComponent(this.finalValue.webFallback);
        }

        finalUrl = finalUrl + ";end";

        return finalUrl;
    },

    /**
     *  TODO
     *  Intent to original url
    */
    _decomposeIntent: function(intent) {
        return intent;
    },

    /**
     *  Check android new chrome.
    */
    _isAndroidNewChrome: function() {
        return  this.client.os.name === "Android" &&
                this.client.browser.name === "Chrome" &&
                this.client.browser.major >= 25;
    },

    /**
     *  Get query strings from url.
     *  @param {string} url - url string
     *  @return {object} - parameters {key-value}
     */
    _getQueryString: function (url) {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var parser = document.createElement('a');
        parser.href = url;

        var query_string = {};
        var query = parser.search.substring(1);
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    },

    /**
     *  Extract parameters on {{brackets}} from raw deeplink.
     */
    _getRequiredParams: function(rawDeeplink) {
        if (!utils.isExisty(rawDeeplink)) {
            //printer.printWarning("해당 플랫폼의 deeplink template이 없습니다.");
            return [];
        }

        var params = rawDeeplink.split("{{");
        if (params.length > 1) {
            for (var i=0; i<params.length-1; i++) {
                params[i] = params[i+1].split("}}")[0];
            }
        }
        params.pop(); // remove last element

        return params;
    },

    /**
     *  Attach parameters for Airbridge mobile SDK.
     */
    _setSDKParams: function(deeplink) {
        /* ===============================================
         *  Remove trailing slash (to fix android bug)
         =================================================*/
        if (deeplink.split("://").length > 1 && deeplink.substr(-1) === "/") {
            deeplink = deeplink.replace(/\/+$/, "");
        }

        if (this.app.sdkFlag != 0) {
            var sdkParams = "transactionId=" + this.client.transactionId + "&udl=true";

            if (this._isIntent(deeplink)) {
                var tmpUrl = deeplink.split("#Intent")[0];
                var newUrl = this._addParamsToUrl(tmpUrl, sdkParams);
                return deeplink.replace(tmpUrl, newUrl);
            } else {
                return this._addParamsToUrl(deeplink, sdkParams)
            }
        }

        return deeplink;
    },

    /**
     *  Set indicies on raw deeplink.
     */
    _setIndiciesOnRawDeeplink: function(indicies, rawDeeplink, device) {
        var deeplink = rawDeeplink.replace(" ", "");
        var replaceString;
        for (var property in indicies) {
            if (indicies.hasOwnProperty(property) && property==device) {
                for (var idx in indicies[property]) {
                    if(indicies[property].hasOwnProperty(idx)) {
                        replaceString = "{{"+idx+"}}";
                        deeplink = deeplink.replace(replaceString, indicies[property][idx]);
                    }
                }
            }
        }
        return deeplink;
    },

    /**
     *  Check whether the completeDeeplink is valid or not.
     */
    _isValidDeeplink: function() {
        // TODO 나중에 {{ 없애줘야 함.
        if (!utils.isExisty(this.client.completeDeeplink) || this.client.completeDeeplink.trim() == "" || this.client.completeDeeplink.indexOf("{{") != -1) {
            return false;
        } else {
            return true;
        }
    },

    /**
     *  Execute.
    */
    exec: function() {
        if (!this._isValidDeeplink()) {
            this.printWarning("유효하지 않은 URL입니다. (" + this.client.completeDeeplink + ")");
            return;
        }

        // TODO Set buttons
        this._setButtonFunc();

        if (this.config.redirect) {
            this._tryAirbridgeCommands("redirect");
        }
    },


    attachAirbridgeReferrer: function(url, airbridgeReferrer) {
        if (url.indexOf('airbridge_referrer') == -1) {
            return this._addParamsToUrl(url, airbridgeReferrer);
        }
        return url
    },

    /**
     *  Try app launch. if there is no launch event, then go to store.
     *
     *  <iOS>
     *  1. (앱 기설치) 모바일 앱으로 이동한 경우
     *  2. (앱 미설치) 앱 스토어로 이동. reach__web_to_app을 지우고 reach__web_to_market을 올려줘야함.
     *
     *  <Android - Intent 필터인 경우>
     *  1. (앱 기설치) 모바일 앱으로 이동한 경우
     *  2. (앱 미설치) 앱 스토어로 이동. reach__web_to_app을 지우고 reach__web_to_market을 올려줘야함.
     *
     *  <Desktop>
     *  1. 웹페이지로 이동 reach__web_to_web
     *
     *  @param {string} eventName - predefined event name: load, click, redirect
     *
     *  앱을 쌓고 2초 안에 launch가 안터지면 reach__web_to_app -> reach__web_to_market
     *  마켓을 쌓고 2초 안에 launch가 터지면 reach__web_to_market -> reach__web_to_app
    */
    _tryAirbridgeCommands: function(eventName) {
        if (eventName != "redirect" && eventName != "click") {
            this.printWarning("유효하지 않은 이벤트입니다.");
            return;
        }

        var self = this;

        this.airbridge.__sendSimplelinkEvent({
            eventCategory: self.isMobile()? eventCategory['reach__web_to_app']:eventCategory['reach__web_to_web'],
            targetUrl: this.client.originalDeeplink,
            simplelinkData: this.linkData
        }, function(err, res) {
            // Airbridge Referrer Parameter 구하고
            self.finalValue.airbridgeReferrer = res['airbridgeReferrer'];
            var device = self.client.ua.platform.toLowerCase();

            // Set Final Fallback with airbridgeReferrer
            if (self._isExisty(self.config.fallbacks[device])) {
                if (self.config.fallbacks[device] == 'itunes-appstore') {
                    self.finalValue.fallback = res['markets']['itunes-appstore'] || self.app.iOSMarket;
                } else if (self.config.fallbacks[device] == 'google-play') {
                    self.finalValue.fallback = res['markets']['google-play'] || self.app.androidMarket;
                } else if (self._isHTTP(self.config.fallbacks[device])) {
                    self.finalValue.fallback = self.attachAirbridgeReferrer(self.config.fallbacks[device], self.finalValue.airbridgeReferrer);
                    self.finalValue.webFallback = self.finalValue.fallback;
                }
            } else {
                if (device == 'ios') {
                    self.finalValue.fallback = res['markets']['itunes-appstore'] || self.app.iOSMarket;
                } else if (device == 'android') {
                    self.finalValue.fallback = res['markets']['google-play'] || self.app.androidMarket;
                }
            }

            self.client.completeFallback = self.finalValue.fallback;

            // set complete deeplink
            if (self.config.version == 1.0) {
                // Set Final Deeplink with airbridgeReferrer
                self.client.completeDeeplink = self.client.completeDeeplink || self._getTargetDeeplink();
            } else {
                // Set Final Deeplink with airbridgeReferrer
                self.client.completeDeeplink = self._getTargetDeeplink();
                // Attach Airbridge Referrer
                self.client.completeDeeplink = self.attachAirbridgeReferrer(self.client.completeDeeplink, self.finalValue.airbridgeReferrer)
                if (device == 'android') {
                    // TODO 애초에 intent:로 들어오지 못하도록 가이드
                    if (self._isIntentSupport()) {
                        if (utils.isExisty(self.finalValue.webFallback)) {
                            self.client.completeDeeplink = self._getIntent(self.client.completeDeeplink, self.app.androidMarket);
                        } else {
                            self.client.completeDeeplink = self._getMarketDeeplink(self.client.completeDeeplink, self.app.androidMarket);
                        }
                    } else {
                        self.client.completeDeeplink = self._getMarketDeeplink(self.client.completeDeeplink, self.app.androidMarket);
                    }
                }
            }

            // app 시도하는 단(OS)에서 fallback 처리하거나
            //   - Android는 fallback에 따라 market/intent를 써야함
            self.launchDeeplink();

            // only launch on mobile platform
            if (self._haveToTryStore()) {
                self._deferCallback(function() {
                    if (self._isExisty(self.finalValue.fallback)) {
                        self.launchFallback();
                    } else {
                        self.launchStore();
                    }

                }, self.client.ua.platform=='iOS'? self.TIMEOUT.IOS_LONG:self.TIMEOUT.ANDROID);
            }

            if (typeof self.config.callbackAfterLoad == "function") {
                self.config.callbackAfterLoad(null, self);
            }
        })
    },

    _setButtonFunc: function() {
        this.printConsole("_setButtonFunc is called.");

        var self = this;
        for (var i=0; i<this.config.buttonId.length; i++) {

            var button = document.getElementById(this.config.buttonId[i]);
            if (!button) continue;

            button.onclick = function() {
                self._tryAirbridgeCommands("click");
            };
        }
    },

    /**
     *  Check it is mobile.
    */
    isMobile: function() {
        if (this.client.ua.platform == 'iOS' || this.client.ua.platform == 'Android') {
            return true
        } else{
            return false
        }
    },

    /**
     *  Launch app.
    */
    launchDeeplink: function() {
        this.printConsole("launchDeeplink is called.");

        // try app, if not store
        switch (this.client.ua.os.name) {
            case 'iOS':
                this._launchiOS();
                break;
            case 'Android':
                this._launchAndroid();
                break;
            default:
                this._launchDesktop();
                break
        }

        this._printTestLauncher();
    },

    /**
     *  Launch fallback.
    */
    launchFallback: function() {
        this.printConsole("launchFallback is called.");

        switch (this.client.ua.os.name) {
            case 'iOS':
                this._replaceLaunch(this.finalValue.fallback);
                break;
            case 'Android':
                this._replaceLaunch(this.finalValue.fallback);
                break;
            default:
                var marketUrl = this._createHttpMarketUrl(this.app.androidMarket) || this._createHttpMarketUrl(this.app.iOSMarket);
                this._hrefLaunch(marketUrl);
                break;
        }

        this._printTestLauncher('fallback');
    },

    /**
     *  Launch store.
    */
    launchStore: function() {
        this.printConsole("launchStore is called.");

        var marketUrl = "";

        switch (this.client.ua.os.name) {
            case 'iOS':
                marketUrl = this.app.iOSMarket;
                this._replaceLaunch(marketUrl);
                break;
            case 'Android':
                marketUrl = this.app.androidMarket;
                this._replaceLaunch(marketUrl);
                break;
            default:
                marketUrl = this._createHttpMarketUrl(this.app.androidMarket) || this._createHttpMarketUrl(this.app.iOSMarket);
                this._hrefLaunch(marketUrl);
                break;
        }

        this._printTestLauncher('store');
        return marketUrl;
    },

    /**
     *  Make market deeplink to http url.
    */
    _createHttpMarketUrl: function(marketUrl) {
        return marketUrl.replace("market://", "https://play.google.com/store/apps/").replace("itms-app://","https://");
    },

    /**
     *  Attach parameters to url.
    */
	_addParamsToUrl: function(url, paramString) {
        if (url.indexOf("?") != -1) {
            url = url + "&" + paramString;
        } else {
            url = url + "?" + paramString;
        }
        return url;
    },

    /**
     *  Launch iOS deeplink with each different launcher.
    */
    _launchiOS: function() {
        var os_version = parseFloat(this.client.ua.os.version);

        if (this.client.ua.browser.name == 'Facebook' && os_version >= 9.0 && os_version < 9.2) {
            // FTP 프로토콜로 FB앱을 탈출합니다.
            this._ftpRedirect();
        } else if (this.client.ua.browser.name == 'Mobile Safari' && os_version >= 9.0 && os_version < 9.2) {
            // 경고창을 무시하기 위해 try app 하고, uninstalled 플래그와 함께 redirect 시킵니다.
            // abredirect to remove alert
            if (!utils.isUninstalled()) {
                this._forceRedirect();
            }
        } else if (os_version > 9.0) {
            this._hrefLaunch(this.client.completeDeeplink);
        } else {
            this._iFrameLaunch(this.client.completeDeeplink);
        }
    },

    /**
     *  Force refresh page with uninstalled flag.
    */
    _forceRedirect: function() {
        this.test.launcher = "_forceRedirect";

        var self = this;

        // Try mobile deeplink
        this._hrefLaunch(this.client.completeDeeplink);

        // Wait 0.5 sec, if there is no action, Assume that the app isn't installed.
        setTimeout(function() {
            var redirectUrl = self._addParamsToUrl(window.location.href, "uninstalled=1");
            self._hrefLaunch(redirectUrl);
        }, 500);
    },

    /**
     *  FTP redirect to escape facebook in-app browser.
     */
    _ftpRedirect: function() {
        this.test.launcher = "_ftpRedirect";

        var currentLocation = "ftp://redirect.airbridge.io/index.html?target="+ window.location.href;
        this._hrefLaunch(this._addParamsToUrl(currentLocation, "abredirect=1&transactionId="+this.client.transactionId));
    },

    _setGoogleReferrer: function() {
        //this.app.androidMarket = this._addParamsToUrl(this.app.androidMarket, "url="+this.client.completeDeeplink);
    },

    /**
     *  Launch android deeplink with each different launcher.
     */
    _launchAndroid: function() {
        var parser = this._getParser(this.client.completeDeeplink);

        if (parser.protocol == 'http:' || parser.protocol == 'https:' || parser.protocol == 'intent:' || parser.protocol == 'market:') {
            this._hrefLaunch(this.client.completeDeeplink);
        } else if (this.client.ua.browser.name == 'Facebook') {
            this._replaceLaunch(this.client.completeDeeplink);
        } else {
            this._iFrameLaunch(this.client.completeDeeplink);
        }
    },

    /**
     *  Launch desktop url with each different launcher.
     */
    _launchDesktop: function(assert) {
        if (this.config.sms) {
            this.printConsole("Show sms modal");
        } else {
            if (this.config.webPopup) {
                this._windowOpenLaunch(this.client.completeDeeplink);
            } else {
                this._hrefLaunch(this.client.completeDeeplink);
            }
        }
    },

    /**
     * Defer call callback
     * @param {function} callback A callback
     * @param {number} time A delay time
     * @returns {number|undefined} Timer id
     */
    _deferCallback: function (callback, time) {
        var clickedAt = new Date().getTime(),
            now,
            self = this;

            if (!this._isFunction(callback)) {
                return;
            }

            return setTimeout(function () {
                now = new Date().getTime();
                if (self._isPageVisibility() && now - clickedAt < time + self.TIMEOUT.INTERVAL) {
                    callback();
                }
            }, time);
    },

    /**
     *  Redirect with window.open.
     */
    _windowOpenLaunch: function(executeUrl) {
        this.test.launcher = "_windowOpenLaunch";
        this.test.excuteUrl = executeUrl;

        if (this.config.actualRedirect) {
            window.open(executeUrl);
        }
    },

    /**
     *  Redirect with iFrame.
     */
    _iFrameLaunch: function(executeUrl) {
        this.test.launcher = "_iFrameLaunch";
        this.test.excuteUrl = executeUrl;

        if (this.config.actualRedirect) {
            var hiddenIFrame = document.createElement("iframe");
            hiddenIFrame.style.width = "0px";
            hiddenIFrame.style.height = "0px";
            hiddenIFrame.border = "none";
            hiddenIFrame.style.display = "none";
            hiddenIFrame.src = executeUrl;
            document.body.appendChild(hiddenIFrame);
        }
    },

    /**
     *  Redirect with window.location.replace.
     */
    _replaceLaunch: function(executeUrl) {
        this.test.launcher = "_replaceLaunch";
        this.test.excuteUrl = executeUrl;

        if (this.config.actualRedirect) {
            window.location.replace(executeUrl);
        }
    },

    /**
     *  Redirect with top.location.href.
     */
    _hrefLaunch: function(executeUrl) {
        this.test.launcher = "_hrefLaunch";
        this.test.excuteUrl = executeUrl;

        if (this.config.actualRedirect) {
            top.location.href = executeUrl;
        }
    },

    _printTestLauncher: function(caller) {
        if (caller === undefined) {
            this.printConsole(this.test.launcher + " is executed => " + this.test.excuteUrl)
        } else {
            this.printConsole(caller + "::" + this.test.launcher + " is executed => " + this.test.excuteUrl)
        }
    },

    /**
     *  Create HTTP request.
     */
    _sendCreatedRequest: function(method, url, data, callback) {
        var req = new XMLHttpRequest;

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
    },

    /**
     *  Create new UUID.
     */
    _getUUID: function() {
        var dec2hex = [];
        for (var i=0; i<=15; i++) {
            dec2hex[i] = i.toString(16);
        }

        var uuid = '';
        for (var i=1; i<=36; i++) {
            if (i===9 || i===14 || i===19 || i===24) {
                uuid += '-';
            } else if (i===15) {
                uuid += 4;
            } else if (i===20) {
                uuid += dec2hex[(Math.random()*4|0 + 8)];
            } else {
                uuid += dec2hex[(Math.random()*15|0)];
            }
        }
        return uuid;
    },

    /**
     *  Clear timeout on page unload.
     */
    _clearTimeoutOnPageUnload: function(redirectTimer) {
        window.addEventListener("pagehide", function() {
            clearTimeout(redirectTimer);
        });
        window.addEventListener("blur", function() {
            clearTimeout(redirectTimer);
        });
        window.addEventListener("unload", function() {
            clearTimeout(redirectTimer);
        });
        document.addEventListener("webkitvisibilitychange", function() {
            if (document.webkitHidden) {
                clearTimeout(redirectTimer);
            }
        });
    },

    /**
     * Extend the target object from other objects.
     * @param {object} target - Object that will be extended
     * @param {...object} objects - Objects as sources
     * @return {object} Extended object
     * @memberOf Airbridge
     */
    _extend: function(target, objects) {
        var source,
        prop,
        hasOwnProp = Object.prototype.hasOwnProperty,
            i,
            len;

            for (i = 1, len = arguments.length; i < len; i++) {
                source = arguments[i];
                for (prop in source) {
                    if (hasOwnProp.call(source, prop)) {
                        target[prop] = source[prop];
                    }
                }
            }
            return target;
    },

    /**
     * check a webpage is visible or in focus
     * @returns {boolean} Page visibility
     */
    _isPageVisibility: function () {
        if (this._isExisty(document.hidden)) {
            return !document.hidden;
        }
        if (this._isExisty(document.webkitHidden)) {
            return !document.webkitHidden;
        }
        return true;
    },

    /**
     * Check whether the given variable is a function or not.
     *  If the given variable is a function, return true.
     * @param {*} obj - Target for checking
     * @return {boolean} Is function?
     */
    _isFunction: function(obj) {
        return obj instanceof Function;
    },

    /**
     *  Check null.
    */
    _isExisty: function(param) {
        return param != null;
    },

    /**
     *  Print warning message.
    */
    printWarning: function(msg) {
        console.warn('%c [AIRBRIDGE] ' + msg, 'background: #FF8103; color: #fff');
    },

    /**
     *  Print console message.
    */
    printConsole: function(msg, color) {
        if (this.config.test) {
            console.log('%c [AIRBRIDGE] ' + msg, 'background: #41CC00; color: #fff');
        }
    }
}
