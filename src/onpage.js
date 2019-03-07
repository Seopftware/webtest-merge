'use strict';

(function(window, document, script, abObject, methods, i, abScript, headScript, macGuffin){
    // i, abScript, headScript는 var와 같은 선언을 해주지 않도록 해줍니다.

    // 가장 최상단의 script를 가져옵니다. 없으면 해당 script를 가지고 있는 script tag를 가져올 것입니다.
    if (!window[abObject] || !window[abObject].queue) { // 2번 정의되지 않도록 합니다.
        headScript = document.getElementsByTagName(script)[0];

        // airbridge 객체를 윈도우 객체로 만듭니다.
        window[abObject] = {
            queue: []
        };
        // methods에 적혀있는 메소드를 airbridge.으로 바로 사용할 수 있도록 하기 위함.
        for(i=0; i<methods.length; i++){
            let m = methods[i]; // per-iteration block scope
            if (~m.indexOf('.')) {
                let objName = m.split('.')[0];
                window[abObject][objName] = window[abObject][objName] || {};
                window[abObject][objName][m.split('.')[1]] = function() {
                    window[abObject].queue.push([m, arguments]);
                }
            }
            window[abObject][m] = function() {
                window[abObject].queue.push([m,arguments]);
            };
        }

        abScript = document.createElement(script);
        abScript.async = 1;
        abScript.src = '{{SCRIPT_SOURCE}}';
        headScript.parentNode.insertBefore(abScript, headScript); // 가장 상단으로 script를 올리자
    }
})(window, document, 'script', 'airbridge', 'init setBanner setDownload setDeeplinks sendSMS sendWeb setUserAgent setUserId setUserEmail setUserPhone setUserAttributes setDeviceIFV setDeviceIFA setDeviceGAID events.send events.signIn events.signUp events.signOut events.purchased events.addedToCart events.productDetailsViewEvent events.homeViewEvent events.productListViewEvent events.searchResultViewEvent'.split(' '))
