goog.require('utils');

describe('airbridge sendSMS', function() {
    var data;

    beforeEach(function(done) {
        loadAirbridgeWithInit(done);
        data = {
            phoneNum: '01092454596',
            message: '[airbridgetest] SMS 문자발송 테스트 성공',
            channel: 'channel',
            params: {
                campaign: 'campaign-test',
                term: 'term',
                medium: 'medium',
                content: 'content'
            }
        }
    });
    afterEach(resetAirbridge);

    it('should send sms with correct message', function(done) {
        this.timeout(10000);
        var doneWrap = new Done(done);

        airbridge.sendSMS(data, function(err, res) {
            if (err !== null) {
                expect(err).to.be.ok;
                expect(err.hint).to.be.ok;
                console.dir(err.hint);
                doneWrap.trigger();
            } else {
                var queryString = utils.queryStringToJSON(window.location);

                expect(res.result).to.be.equal('success');
                expect(res.data.phoneNum).to.be.equal(data['phoneNum']);
                expect(res.data.message).to.contain(data['message']);

                if (queryString['airbridge_sid'] === undefined) {
                    expect(res.data.shortUrlData).to.deep.equal({
                        channel: data['channel'],
                        campaign: data['params']['campaign'],
                        term: data['params']['term'],
                        medium: data['params']['medium'],
                        content: data['params']['content']
                    });
                } else {
                    expect(res.data.shortUrlData).to.deep.equal({
                        channel: 'naver.searchad',
                        campaign: queryString['n_campaign'],
                        term: null,
                        medium: null,
                        content: null
                    });
                }
                doneWrap.trigger();
            }
        })
    });

    it('should send sms with warning (long message)', function(done) {
        this.timeout(10000);
        var doneWrap = new Done(done);
        data['message'] = '[airbridgetest] 전 어렸을 때 부터 SMS 메시지가 길었을 경우 테스트를 하고 싶었어요. 세살 버릇 여든까지 간다잖아요?';

        airbridge.sendSMS(data, function(err, res) {
            if (err !== null) {
                expect(err).to.be.ok;
                expect(err.hint).to.be.ok;
                console.dir(err.hint);
                doneWrap.trigger();
            } else {
                expect(res.result).to.be.equal('success');
                expect(res.data.phoneNum).to.be.equal(data['phoneNum']);
                expect(res.data.messageOverflow).to.be.true;
                expect(res.data.message).to.contain('..');
                expect(res.data.message).to.have.length.within(70,80);
                doneWrap.trigger();
            }
        })
    });

    it('should reject request (wrong phone number)', function(done) {
        this.timeout(10000);
        var doneWrap = new Done(done);
        data['phoneNum'] = '010aaaabbbb'

        airbridge.sendSMS(data, function(err, res) {
            expect(err.errorType).to.contain('Invalid request');
            expect(err.message).to.contain('Wrong phone number');
            doneWrap.trigger();
        })
    });
});
