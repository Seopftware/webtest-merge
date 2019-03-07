goog.require('utils');

describe('airbridge setBanner', function() {
    var config = {
        title: 'ab180 블로그',
        description: '앱 마케팅은 에어브릿지에 물어보세요!',
        keyColor: '#0075ff',
        position: 1
    }
    var bannerElements = {
        iFrameId: 'airbridge-websdk-banner',
        downloadButton: 'airbridge-websdk-banner-install-button',
        phonenumInput: 'airbridge-websdk-banner-phonenum-input',
        sendSMSButton: 'airbridge-websdk-banner-send-sms-button',
        closeButton: 'airbridge-websdk-banner-close-button',
    }
    var uaParser = utils.parseUA();

    before(function(done) {
        cookie.set('airbridge-banner-closing','0',-1, false);
        loadAirbridgeWithInit(done);
        airbridge.setBanner(config);
    });
    after(resetAirbridge);

    it('banner가 title, description, keyColor를 가지고 페이지 상단에 나와야합니다.', function() {
        expect(document.getElementById(bannerElements['iFrameId']).contentDocument.all[0].innerText).to.contain(config['title']);
        expect(document.getElementById(bannerElements['iFrameId']).contentDocument.all[0].innerText).to.contain(config['description']);
        expect(document.getElementById(bannerElements['iFrameId']).contentDocument.getElementsByTagName('style')[0].innerText).to.contain(config['keyColor']);
        expect(document.getElementById(bannerElements['iFrameId']).style.top).to.be.equal('0px');
    })

    it('banner에 app icon image가 나와야합니다.', function() {
        expect(document.getElementById(bannerElements['iFrameId']).contentDocument.getElementsByTagName('img')[0].src).to.contain('http');
    })

    config.keyColor = '#ff3333'
    it('WEB SDK 배너 버튼의 RGB컬러가 lightness 60% 이상인 경우, 버튼 내 텍스트 Color를 #2d2d3c로 보입니다.', function() {
        expect(document.getElementById(bannerElements['iFrameId']).contentDocument.getElementsByTagName('style')[0].innerText).to.contain('#2d2d3c');
    });

    it('x 버튼을 누르면 배너가 사라져야합니다.', function() {
        document.getElementById(bannerElements['iFrameId']).contentDocument.getElementById(bannerElements['closeButton']).click();
        expect(document.getElementById(bannerElements['iFrameId'])).to.not.exist;
    });
});
