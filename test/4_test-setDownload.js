/**
 *  Script 받아온 이 후 WEB SDK 사용자 시나리오
*/
goog.require('utils');

describe('airbridge goDownload (this function is executed right after clicking button which is set by setDownload)', function() {
    before(loadAirbridgeWithInit);
    after(resetAirbridge);

    if (window.location.search.indexOf("airbridge_sid") === -1) {
        it('should be redirect users to download url with specific parameters', function(done) {
            this.timeout(10000);

            airbridge.goDownload({
                'channel': 'test-channel',
                'params': {
                    'campaign': 'test-campaign',
                    'content': 'test-content',
                    'customQuery': 'test-custom'
                }
            }, function(err, res) {
								console.dir(res);
                try {
                    switch (airbridge.client.ua.platform) {
                        case 'iOS':
                            expect(res.targetUrl).to.contain('https://itunes.apple.com');
                            break;
                        default:
                            // Android, Desktop
                            var params = utils.queryStringToJSON(res.targetUrl);
                            expect(params).to.have.all.keys('id','referrer');
                            expect(params).to.have.deep.property('id','com.nhn.android.search');
                            expect(params['referrer']).to.contain('udl=true');
                            expect(params['referrer']).to.contain('short_id=');
                            expect(params['referrer']).to.contain('transaction_id=');
                            expect(params['referrer']).to.contain('utm_campaign=test-campaign');
                            expect(params['referrer']).to.contain('utm_source=test-channel');
                            expect(params['referrer']).to.contain('utm_content=test-content');
                            expect(params['referrer']).to.contain('customQuery=test-custom');
                            break;
                    }
                } catch(err) {
                    done(err);
                }
                done();
            });
        });
    } else {
        var queryString = utils.queryStringToJSON(window.location);

        it('should be redirect users to download url with NAVER ADS parameters', function(done) {
            this.timeout(10000);

            airbridge.goDownload({
                'channel': 'test-channel',
                'params': {
                    'campaign': 'test-campaign',
                    'content': 'test-content',
                    'customQuery': 'test-custom'
                }
            }, function(err, res) {
                try {
                    switch (airbridge.client.ua.platform) {
                        case 'iOS':
                            expect(res.targetUrl).to.contain('https://itunes.apple.com');
                            break;
                        default:
                            // Android, Desktop
                            var params = utils.queryStringToJSON(res.targetUrl);
                            expect(params).to.have.all.keys('id','referrer');
                            expect(params).to.have.deep.property('id','com.nhn.android.search');
                            expect(params['referrer']).to.contain('udl=true');
                            expect(params['referrer']).to.contain('short_id=');
                            expect(params['referrer']).to.contain('transaction_id=');
                            expect(params['referrer']).to.contain('utm_campaign='+queryString['n_campaign']);
                            expect(params['referrer']).to.contain('ad_creative='+queryString['n_ad']);
                            expect(params['referrer']).to.contain('ad_group='+queryString['n_ad_group']);
                            expect(params['referrer']).to.contain('utm_source=naver.searchad');
                            break;
                    }
                } catch(err) {
                    done(err);
                }
                done();
            });
        });
    }
});
