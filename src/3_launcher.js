/**
 *  사용자를 실제로 이동 시키는 함수들입니다.
*/

goog.provide('launcher');


var launcher = {
    /**
     *  history를 남기지 않고 이동합니다.
     */
    replaceLaunch: function(url) {
        window.location.replace(url);
    },

   /**
    *  최상위 window 객체를 이동시킵니다. (iframe 대비)
    */
    hrefLaunch: function(url) {
        top.location.href = url;
    }
}
