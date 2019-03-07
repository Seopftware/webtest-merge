/**
 *  일반적인 유틸리티 함수들입니다.
*/
goog.provide('utils');

goog.require('sdkConfig');
goog.require('UAParser');


var eventCategory = {
    'undetermined': 0,
    'view__web': 9120,
    'reach__web_to_web': 9222,
    'reach__web_to_sms': 9223,
    'reach__web_to_ios_market': 9224,
    'reach__web_to_android_market': 9225,
    'reach__web_to_app': 9226,
    'goal__web': 9320,
    'goal__app': 9360
}

var errTypes = {
    initFinished: {
        code: 404,
        errorType: "Multiple init",
        message: "Already initialized"
    },
    appNameRequired: {
        code: 404,
        errorType: "Invalid request",
        message: "App name is required"
    },
    appTokenRequired: {
        code: 404,
        errorType: "Invalid request",
        message: "App token is required"
    },
    requiredFieldEmpty: function () {
        return {
            code: 4001,
            errorType: "Invalid request",
            message: "Required: " + utils.getArgsWithSeperator(',', arguments)
        }
    },
    phoneNumRequired: {
        code: 4001,
        errorType: "Invalid request",
        message: "Phone number is required"
    },
    wrongPhoneNumbers: {
        code: 4002,
        errorType: "Invalid request",
        message: "Wrong phone number"
    }
}

var cookie = {
    get: function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; ARRcookies.length > i; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
    },

    set: function (c_name, value, expireDays, expireMinutes, subdomain) {
        if (value === null) return;

        var expireDate = new Date();
        if(expireMinutes === undefined)
            expireDate.setDate(expireDate.getDate() + expireDays);
        else
            expireDate.setMinutes(expireDate.getMinutes() + expireMinutes);        

        var c_value = escape(value) + ((expireDays === null) ? "" : "; expires=" + expireDate.toUTCString());

        if(subdomain) {
            var domain = window.location.hostname;
            var domainArray = domain.split('.');
            var c_domain = domainArray.length === 1 ? "" : `; domain=.${domainArray[domainArray.length-2]}.${domainArray[domainArray.length-1]}`;
            document.cookie = c_name + "=" + c_value + ";path=/" + c_domain;
        } else {
            document.cookie = c_name + "=" + c_value + ";path=/";
        }

    },
}

var utils = {
    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   {number}  r       The red color value
     * @param   {number}  g       The green color value
     * @param   {number}  b       The blue color value
     * @return  {Array}           The HSL representation
     */
    rgbToHsl: function (r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    },

    hexToRgb: function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    hexToHsl: function (color) {
        var rgb = this.hexToRgb(color);
        return this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    },

    isLighterThan: function (color, than) {
        var rgb = this.hexToRgb(color);
        if (rgb == null) {
            return true;
        }

        var hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (hsl[2] * 100 >= than) {
            return true;
        } else {
            return false;
        }
    },

    getAirbridgeTid: function () {
        var query = this.queryStringToJSON(window.location);

        // Transaction ID를 받아옵니다.
        if (query['airbridge_tid'] !== undefined) {
            return query['airbridge_tid'];
        } else {
            return this.getUUID();
        }
    },

    attachParamsOnMarketReferrer: function (marketUrl, params) {
        if (!this.isExisty(params))
            return marketUrl;

        if (marketUrl.indexOf("&referrer=") == -1) {
            return marketUrl + "&referrer=" + encodeURIComponent(params)
        } else {
            return marketUrl + encodeURIComponent("&" + params)
        }
    },

    getSimplelinkFormatWithShortId: function (shortId) {
        if (!this.isExisty(shortId))
            return undefined;

        return 'http://abr.ge/' + shortId;
    },

    getArgsWithSeperator: function (sep, args) {
        var args = Array.prototype.slice.call(args);
        return args.join(sep);
    },

    /**
     *  Replace app subdomain template
    */
    replaceAppSubdomain: function (text, appName) {
        return text.replace('{{appSubdomain}}', appName)
    },

    /**
     *  Replace app subdomain and event category
    */
    getEventRequestURL: function (text, appName, eventCategory) {
        return text.replace('{{appSubdomain}}', appName).replace('{{eventCategory}}', eventCategory)
    },

    /**
     *  Get UUID
    */
    getUUID: function () {
        var dec2hex = [];
        for (var i = 0; i <= 15; i++) {
            dec2hex[i] = i.toString(16);
        }

        var uuid = '';
        for (var i = 1; i <= 36; i++) {
            if (i === 9 || i === 14 || i === 19 || i === 24) {
                uuid += '-';
            } else if (i === 15) {
                uuid += 4;
            } else if (i === 20) {
                uuid += dec2hex[(Math.random() * 4 | 0 + 8)];
            } else {
                uuid += dec2hex[(Math.random() * 15 | 0)];
            }
        }
        return uuid;
    },

    /**
     *  Check it's empty.
     */
    isExisty: function (param) {
        if (param === null || param === undefined)
            return false;
        else if (typeof (param) == 'string' && param.trim() === '')
            return false;
        return true;
    },

    /**
     *  Url Parameter 이름으로 가져오기
    */
    getParameterByName: function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    /**
     *  Url parameter JSON으로 바꾸기
    */
    queryStringToJSON: function (url) {
        if (url.search.slice !== undefined) {
            var pairs = url.search.slice(1).split('&');
        } else {
            var pairs = url.split('?')[1].split('&');
        }

        var result = {};
        pairs.forEach(function (pair) {
            try {
                pair = pair.split('=');
                result[pair[0]] = decodeURIComponent(pair[1] || '');
            } catch (err) {
            }
        });

        return JSON.parse(JSON.stringify(result));
    },

    splitQueryStringToJSON: function (queryString) {
        try {
            var fakeURL = "https://airbridge.io?" + queryString;
            return this.queryStringToJSON(fakeURL);
        } catch (err) {
            return {};
        }
    },

    /**
     *  URL 뒤에 파라미터를 붙입니다.
    */
    addParameterToURL: function (url, param) {
        url += (url.split('?')[1] ? '&' : '?') + param;
        return url;
    },

    /**
     *  Phonenumber validation
    */
    isValidPhoneNumber: function (num) {
        // 01로 시작하고 && 10자리거나 11자리 (only for Korea)
        var pattern = /^01[0-9]{8,9}$/g;
        return pattern.test(num);
    },

    parseUA: function (uaString) {
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

    isUninstalled: function () {
        if (window.location.href.indexOf("uninstalled=1") != -1) {
            return true;
        } else {
            return false;
        }
    },

    clone: function (obj) {
        if (obj === null || typeof (obj) !== 'object')
            return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }
}

var printer = {
    /**
     *  Print warning message.
     */
    printWarning: function (msg) {
        console.warn('%c [AIRBRIDGE] ' + msg, 'background: #FF8103; color: #fff');
    },

    /**
     *  Print Error message.
     */
    printError: function (msg) {
        console.error('%c [AIRBRIDGE] ' + msg, 'background: #D60000; color: #fff');
    },

    /**
     *  Print message.
    */
    printConsole: function (msg) {
        if (sdkConfig['test']) {
            console.log('%c [AIRBRIDGE] ' + msg, 'background: #41CC00; color: #fff');
        }
    }
}
