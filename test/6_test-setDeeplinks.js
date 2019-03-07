goog.require('utils');


describe('Utils for deeplinks', function() {
    beforeEach(loadAirbridgeWithInit);
    afterEach(resetAirbridge);

    it('Market URL에 airbridge referrer 붙이기', function() {
        var marketUrlWithoutReferrer = "https://play.google.com/store/apps/details?id=com.github.codertimo.pokerface";
        var referrer = "airbridge_referrer=" + encodeURIComponent("a=1&b=2&c=3")
        var result = utils.attachParamsOnMarketReferrer(marketUrlWithoutReferrer, referrer);
        expect(result).to.be.equal(marketUrlWithoutReferrer+"&referrer="+encodeURIComponent(referrer))
    })

    it('Market URL with referrer에 airbridge referrer 붙이기', function() {
        var marketUrlWithReferrer = "https://play.google.com/store/apps/details?id=com.github.codertimo.pokerface&referrer=a%3D1";
        var referrer = "b=1&airbridge_referrer=" + encodeURIComponent("a=1&b=2&c=3")
        var result = utils.attachParamsOnMarketReferrer(marketUrlWithReferrer, referrer);
        expect(result).to.be.equal(marketUrlWithReferrer+"%26"+encodeURIComponent(referrer))
    })
})



var devices = [
    {
        ua: 'Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        caller: '',
        finalURL: 'intent://redirect?haha=hoho&airbridge_referrer=',
        fallback: 'http://hunjae.com',
        fallbackAnswer: 'http://hunjae.com?airbridge_referrer'
    },
]


describe('Deeplink', function() {
    if (utils.isUninstalled()) { return }

    beforeEach(loadAirbridge);
    afterEach(resetAirbridge);

    it('Handle deeplink', function(done) {
        this.timeout(5000);
        var doneWrap = new Done(done);

        // app 이름과 token 둘 다 성공
        airbridge.init({
            app: 'ablog',
            appToken: '38acf1efa9fc4f0987173f5a76516eb1'
        },function(err, res) {
            expect(res.app.appSubdomain).to.be.equal('ablog');
            doneWrap.trigger();
        });

        for (let i=0; i<devices.length; i++) {
            airbridge.setUserAgent(devices[i]['ua'])

            airbridge.setDeeplinks({
                buttonID: "test-deeplink-button",
                test: true,
                redirect: true,
                actualRedirect: false,
                desktopPopUp: true,
                deeplinks: {
                    ios: "ablog://redirect?haha=hoho",
                    android: "ablog://redirect?haha=hoho",
                    desktop: "hunjae.com"
                },
                fallbacks: {
                    ios: devices[i]['fallback'],
                    android: devices[i]['fallback']
                },
                usePlayStoreDeferred: true
            }, function(err, res) {
                console.log(res.client.completeDeeplink);
                console.log(devices[i]);

                expect(res.client.completeDeeplink).to.be.contain("airbridge_referrer");
                expect(res.client.completeDeeplink).to.be.contain(devices[i]['finalURL']);
                expect(res.client.completeFallback).to.be.contain(devices[i]['fallbackAnswer']);
                console.log(res.client.completeDeeplink)

                expect(res).to.be.ok;
            });
        }

        setTimeout(function() {
            doneWrap.trigger();
        }, 3000); // wait for async stats
    });
});
