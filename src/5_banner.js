goog.provide('banner');

goog.require('utils');

/**
 *  Component화 하자.
*/
var htmlUtils = {
    createIframe: function(config, target) {
        var iframe = document.createElement('iframe');
        iframe.src = 'about:blank';
        iframe.style.overflow = 'hidden';
        iframe.style.border = '0';
        if (config['position'] <= 2) {
            iframe.style.position = 'fixed';
        } else {
            iframe.style.position = 'absolute';
        }
        iframe.style.left = '0';
        if (config['position']%2 == 0) {
            iframe.style.bottom = '0';
            iframe.style.boxShadow = '0 -1px 0 rgba(0,0,0,.06)';
        } else {
            iframe.style.top = '0';
            iframe.style.boxShadow = '0 1px 0 rgba(0,0,0,.06)';
        }
        iframe.style.zIndex = '9998';
        iframe.style.width = '100%';
        iframe.style.height = '81px';
        iframe.scrolling = 'no';
        iframe.id = config.bannerElements['iFrameId'];
        document.body.appendChild(iframe);

        if (config.keyColor == undefined || utils.hexToRgb(config.keyColor) === null) {
            config.keyColor = '#0082ff';
        } else if (config.keyColor.indexOf('#') == -1) {
            config.keyColor = '#'+config.keyColor;
        }

        var fontColor = '#fff';
        if (utils.isLighterThan(config.keyColor, 60)) {
            fontColor = '#2d2d3c';
        }

        var iframeHTML;
        var headerHTML = `
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <title>title</title>
            <link rel='stylesheet prefetch' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css'>
            <style>

            body {
              margin: 0;
              font-size: 0;
              font-family: "Noto Sans KR", Hevetica, "Apple SD Gothic Neo", "“애플 SD 산돌고딕 Neo”", 나눔바른고딕, NanumBarunGothic, 나눔바른고딕OTF, NanumBarunGothicOTF, 나눔고딕, NanumGothic, "Nanum Gothic", "맑은 고딕", "Malgun Gothic", Ngothic, Arial, sans-serif;
            }

            .airbridge-banner {
              width: 100%;
              min-width: 320px;
              height: 80px;
              background: #fff;
            }

            .airbridge-banner.pc {
              min-width: 768px;
            }

            .airbridge-banner-close {
              display: inline-block;
              position: relative;
              left: 0;
              padding: 0;
              width: 33px;
              height: 80px;
              line-height: 80px;
              color: rgba(0, 0, 0, .15);
              font-size: 15px;
              text-align: center;
              vertical-align: top;
              background: 0;
              border: 0;
              cursor: pointer;
              line-height: 80px;
              transition: color .1s;
            }

            .airbridge-banner-close:hover {
              color: rgba(0, 0, 0, .25);
            }

            .airbridge-banner-info {
              display: inline-block;
              position: relative;
              padding: 14px 0;
              vertical-align: top;
            }

            .airbridge-banner-info-icon {
              width: 40px;
              height: 40px;
              margin-top: 5px;
              border: 1px solid rgba(0, 0, 0, .06);
              border-radius: 100%;
            }

            .airbridge-banner-info-title {
              position: relative;
              padding-left: 15px;
              width: 155px;
              font-size: 14px;
              color: rgba(45, 45, 60, 1);
              font-weight: 500;
            }

            .airbridge-banner-info-desc {
              position: relative;
              padding-left: 15px;
              top: 3px;
              width: 155px;
              font-size: 12px;
              letter-spacing: -0.5px;
              color: rgba(45, 45, 60, .5);
              line-height: 1.3em;
              font-weight: normal;
            }

            .airbridge-banner-btn {
              display: inline-block;
              float: right;
              box-sizing: border-box;
              margin: 0 15px;
              padding: 0 10px;
              height: 33px;
              line-height: 33px;
              position: relative;
              top: 23px;
              font-size: 14px;
              text-align: center;
              border-radius: 3px;
              font-weight: 500;
              border: 1px rgba(0, 0, 0, .06);
              cursor: pointer;
            }

            .airbridge-banner-input-desc {
              display: inline-block;
              position: relative;
              top: 31px; 
              font-size: 11px;
              padding-right: 20px;
              color: #d0d2d7;
              text-align: right;
              letter-spacing: -0.5px;
            }

            .airbridge-banner-input {
              font-size: 14px;
              color: #2d2d3c;
              width: 125px;
              height: 33px;
              padding: 0px 10px 0 17px;
              position: relative;
              top: 23px;
              border: 2px solid rgba(0, 0, 0, 0.15);
              border-width: 0 0 2px;
              transition: border .1s;
              border-radius: 0;
            }

            .airbridge-banner-input:focus {
              border: 2px solid ${config.keyColor};
              border-width: 0 0 2px;
              outline: none;
            }
            </style>
          </head>
        `

		var bodyHTML;
        var desktopButton = "";
        if (target == 'mobile') {
            //TODO load from html file
			bodyHTML = `
			  <div class="airbridge-banner"> <button id="${config.bannerElements.closeButton}" class="airbridge-banner-close">      <i class="fa fa-times"></i>    </button>
				<div class="airbridge-banner-info"> <img src="${config.appIconImageUrl}" alt="App icon image" class="airbridge-banner-info-icon" /> </div>
				<div class="airbridge-banner-info">
					<div class="airbridge-banner-info-title"> ${config.title} </div>
					<div class="airbridge-banner-info-desc"> ${config.description} </div>
				</div> 
				<button id="${config.bannerElements.downloadButton}" class="airbridge-banner-btn" style="background: ${config.keyColor}; color: #fff;">설치</button> 
			  </div>
			`
        } else {

            if (config.desktopInstall !== undefined || config.desktopInstall == true) {
                if (config.desktopMarketType == 'android') {
                    desktopButton = `<button id="${config.bannerElements.downloadButton}" class="airbridge-banner-btn" style="margin-left: -5px; background: ${config.keyColor}; color: #fff;" title="구글 플레이스토어에서 앱 다운로드"><i class="fa fa-android" style="padding-right: 5px; font-size: 17px;"></i><i class="fa fa-arrow-down" style="color: rgba(255,255,255,.5);"></i></button>`
                } else {
                    desktopButton = `<button id="${config.bannerElements.downloadButton}" class="airbridge-banner-btn" style="margin-left: -5px; background: ${config.keyColor}; color: #fff;" title="애플 앱스토어에서 살펴보기"><i class="fa fa-apple" style="padding-right: 5px; font-size: 17px;"></i><i class="fa fa-chevron-right" style="color: rgba(255,255,255,.5);"></i></button>`
                }
            }

            // Add Android Install Button
            bodyHTML = `
              <div class="airbridge-banner pc"> <button id="${config.bannerElements.closeButton}" class="airbridge-banner-close">      <i class="fa fa-times"></i>    </button>
                <div class="airbridge-banner-info"> <img src="${config.appIconImageUrl}" alt="App icon image" class="airbridge-banner-info-icon" /> </div>
                <div class="airbridge-banner-info">
                  <div class="airbridge-banner-info-title"> ${config.title} </div>
                  <div class="airbridge-banner-info-desc"> ${config.description} </div>
                </div>

                ${desktopButton}

                <div style="position: relative; display: inline-block; float: right;">
                  <div class="airbridge-banner-input-desc"> 입력한 핸드폰번호는<br>저장되지 않습니다 </div>
                  <div style="display: inline-block; vertical-align: top;">
                    <div style="position: absolute; top: 30px; z-index: 1; color: #a9acb6; font-size: 20px;">
                        <i class="fa fa-mobile"></i>
                    </div> 
                    <input type="text" id="${config.bannerElements.phonenumInput}" class="airbridge-banner-input" placeholder="핸드폰번호 입력" /> </div> 
                    <button id="${config.bannerElements.sendSMSButton}" class="airbridge-banner-btn" style="background: ${config.keyColor}; color: ${fontColor};">앱설치링크 보내기</button> 
                  </div>
                </div>
            `
        }

		var iframeHTML = `
						<!DOCTYPE html>
						${headerHTML}
						<body>
						${bodyHTML}
						</body>
						</html> `

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(iframeHTML);
        iframe.contentWindow.document.close();

        return iframe;
    }
}

var banner = {

    alertMessage: {
        'success': '입력하신 전화번호로 앱설치 링크를 보내드렸습니다. 핸드폰에서 확인해주세요.',
        'wrongFormat': '올바른 형식으로 입력해주세요.',
        'emptyFormat': '항목을 입력해주세요.',
        'tooMuchTry': '메시지를 처리중입니다. 여유를 가지고 기다려보는 것은 어떨까요?'
    },

    moveBody: function(position) {
        var currentMargin = parseFloat(document.body.style.marginTop.split('px')[0] || 0);
        if (position%2 == 1) {
            // 아래로 81px 이동
            document.body.style.marginTop = (currentMargin + 81).toString()+'px';
        } else {
            // 위로 81px 이동
            document.body.style.marginTop = (currentMargin - 81).toString()+'px';
        }
    },

    bannerElements: {
        iFrameId: 'airbridge-websdk-banner',
        downloadButton: 'airbridge-websdk-banner-install-button',
        phonenumInput: 'airbridge-websdk-banner-phonenum-input',
        sendSMSButton: 'airbridge-websdk-banner-send-sms-button',
        closeButton: 'airbridge-websdk-banner-close-button',
    },

    config: {
        customConfig: undefined,
        active: false
    },

    iFrameRef: function(frameRef) {
        return frameRef.contentWindow
        ? frameRef.contentWindow.document
        : frameRef.contentDocument
    },

    createBanner: function(platform, appData, customConfig, callbacks, airbridge) {
        var self = this;

        if (cookie.get('airbridge-banner-closing') !== undefined) {
            printer.printConsole('banner closing status is on');
            return;
        }

        var desktopMarketType = 'android';
        if (!utils.isExisty(appData.androidMarket) && utils.isExisty(appData.iOSMarket)) {
            desktopMarketType = 'ios';
        }

        self.config.customConfig = customConfig;

        // 닫기 버튼을 누르면 하루짜리 쿠키를 심어서 상태를 지속되게 만듭니다.
        if (platform == 'Web') {
            /**
             *  iFrame 만들기
            */

            // Desktop은 top으로 위치를 고정합니다.
            customConfig['position'] = 1;

            htmlUtils.createIframe({
                title: customConfig['title'],
                keyColor: customConfig['keyColor'],
                description: customConfig['description'],
                appIconImageUrl: appData['appIconImageUrl'],
                position: parseInt(customConfig['position']),
                bannerElements: this.bannerElements,
                desktopInstall: customConfig['desktopInstall'],
                desktopMarketType: desktopMarketType
            }, 'desktop');


            try {
                var inside = self.iFrameRef(document.getElementById(self.bannerElements.iFrameId));

                /**
                 *  X 누르면 Closing
                */
                self.setCloseButton(inside);

                /**
                 *  Enter 눌렀을때 문자 전송
                */
                inside.getElementById(self.bannerElements.phonenumInput).addEventListener('keydown', function(evt) {
                    if (evt.keyCode == 13) {
                        inside.getElementById(self.bannerElements.sendSMSButton).onclick();
                    }
                });

                /**
                 *  마우스로 클릭시 문자보내기
                */
                inside.getElementById(self.bannerElements.sendSMSButton).onclick = function() {
                    callbacks['sendSMS'].bind(airbridge)({
                        phoneNum: inside.getElementById(self.bannerElements.phonenumInput).value,
                        channel: '',
                        params: {}
                    }, function(err, res) {
                        if (err) {
                            switch (err.code) {
                                case 4001:
                                    alert(self.alertMessage.emptyFormat);
                                    break;
                                case 4002:
                                    alert(self.alertMessage.wrongFormat);
                                    break;
                                default:
                                    alert(self.alertMessage.tooMuchTry);
                                    break;
                            }

                            return;
                        }
                        alert(self.alertMessage.success);
                        console.dir(res);
                    });
                }

                /**
                 *  Download button 등록
                */
                try {
                    inside.getElementById(self.bannerElements.downloadButton).onclick = function() {
                        callbacks['goDownload'].bind(airbridge)({
                            channel: '',
                            params: {}
                        }) // Don't need callback
                    }
                } catch (err) {
                    printer.printConsole('다운로드 버튼 설정이 되어있지 않습니다.');
                }
            } catch(err) {
                console.log(err);
            }
        } else {
            /**
             *  iframe 만들기
            */
            htmlUtils.createIframe({
                title: customConfig['title'],
                keyColor: customConfig['keyColor'],
                description: customConfig['description'],
                appIconImageUrl: appData['appIconImageUrl'],
                position: parseInt(customConfig['position']),
                bannerElements: this.bannerElements
            }, 'mobile');

            try {
                var inside = self.iFrameRef(document.getElementById(self.bannerElements.iFrameId));

                /**
                 *  X 누르면 Closing
                */
                self.setCloseButton(inside);

                /**
                 *  Download button 등록
                */
                try {
                    inside.getElementById(self.bannerElements.downloadButton).onclick = function() {
                        callbacks['goDownload'].bind(airbridge)({
                            channel: '',
                            params: {}
                        }) // Don't need callback
                    }
                } catch (err) {
                    printer.printConsole('다운로드 버튼 설정이 되어있지 않습니다.');
                }
            } catch(err) {
                console.log(err);
            }
        }

        this.moveBody(customConfig['position'])
    },

    setCloseButton: function(iframe) {
        var self = this;

        iframe.getElementById(self.bannerElements.closeButton).onclick = function() {
            cookie.set('airbridge-banner-closing', '1', 1, false);
            var banner = document.getElementById(self.bannerElements.iFrameId);
            banner.parentNode.removeChild(banner);

            self.moveBody((self.config.customConfig['position']+1)%2);
        }
    }
}
