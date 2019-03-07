goog.require('utils');

describe('airbridge init', function() {
    beforeEach(loadAirbridge);
    afterEach(resetAirbridge);

    it('token 없을시 초기화 실패', function(done) {
        this.timeout(2000);
        var doneWrap = new Done(done);

        // token 없을시 init 실패
        airbridge.init({
            app: 'naver_ads_test',
            appToken: 'EMPTY'
        },function(err, res) {
            expect(err.status).to.be.equal(400);
            expect(JSON.parse(err.responseText).hint).to.be.equal("App token is not valid - no results");
            doneWrap.trigger();
        });
    });

    it('앱 이름과 token 일치시 초기화 성공', function(done) {
        this.timeout(2000);
        var doneWrap = new Done(done);

        // app 이름과 token 둘 다 성공
        airbridge.init({
            app: 'naver_ads_test',
            appToken: '0b92571ff7aa460f811b44c8e9ce7383',
        },function(err, res) {
            expect(res.app.appSubdomain).to.be.equal('naver_ads_test');
            doneWrap.trigger();
        });
    });
});
