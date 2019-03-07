# How to set up your development environment

1. install [node](https://nodejs.org/en/)

2. install dependencies
```
$ npm install -g grunt-cli
$ npm install
$ brew install wget
$ make closure-compiler
$ make closure-library
```

3. make script and run
```
$ make test
$ npm run dev
```

# Insert Script

```
<!-- body 태그 안 끝에 해당 스크립트를 넣는 것을 권장합니다. -->
<script>
// load airbridge websdk script
(function(a_,i_,r_,_b,_r,_i,_d,_g,_e){if(!a_[_b]||!a_[_b].queue){_g=i_.getElementsByTagName(r_)[0];a_[_b]={queue:[]};_d={};for(_i=0;_i<_r.length;_d={m:_d.m},_i++){_d.m=_r[_i],~_d.m.indexOf(".")&&(_e=_d.m.split(".")[0],a_[_b][_e]=a_[_b][_e]||{},a_[_b][_e][_d.m.split(".")[1]]=function(_d){return function(){a_[_b].queue.push([_d.m,arguments]);};}(_d)),a_[_b][_d.m]=function(_d){return function(){a_[_b].queue.push([_d.m,arguments]);};}(_d);}_d=i_.createElement(r_);_d.async=1;_d.src="http://static.airbridge.io/sdk/latest/airbridge.min.js";_g.parentNode.insertBefore(_d,_g);}})(window,document,"script","airbridge","init setBanner setDownload setDeeplinks sendSMS sendWeb setUserAgent setUserId setUserEmail setDeviceIFV setDeviceIFA setDeviceGAID events.send events.signIn events.signUp events.purchased events.addedToCart".split(" "));

// initialize
airbridge.init({
  app: 'app 이름',
  appToken: 'app 토큰',
  defaultChannel: '대시보드에서 확인할 채널명' // 기본적으로 airbridge.websdk값이 설정되어있습니다.
  downloadButtonIds: ["download-button-1", "download-button-2", "download-button-3"], // Download 버튼으로 만들 button tag id
  defaultParams: {
    campaign: '대시보드에서 확인할 캠페인명', 
    medium: '대시보드에서 확인할 매체명'
    // .. 원하는 파라미터로 심플링크를 생성하여 통계를 쌓을 수 있습니다.
  }
});
</script>
```

## 1. 웹페이지에 빠르게 설치할 수 있는 웹투앱 배너

웹투앱배너는 모바일 웹과 데스크탑 웹에서 사용자를 앱으로 보내주는 배너입니다. 배너에 들어가게 될 제목과 설명, 그리고 버튼 컬러를 넣어 스크립트를 만들어보세요.

```
// 기본 배너를 설정하는 코드, 이 코드를 삭제할 시 기본 배너가 더이상 노출되지 않습니다.
airbridge.setBanner({
  "desktopInstall": true, // desktop 사용자에게 "안드로이드 마켓"으로 이동하는 버튼이 노출됩니다. iOS 앱만 있는 경우, "iOS 마켓"으로 이동하는 버튼이 노출됩니다.
	"title": "마음편히 앱 설치",
	"description": "뿌거 앱 설치하고 더욱 편하게 서비스 이용하세요",
	"keyColor": "00bcd4",
	"position": 1
});
```

웹투앱배너는 [에어브릿지 대시보드](https://airbridge.io)에서 확인해볼 수 있습니다.

![](http://docs.airbridge.io/Screen%20Shot%202016-08-04%20at%208.04.15%20PM.png)


## 2. 웹페이지 조회(TBD), 다운로드 버튼 클릭으로 인한 앱 설치 추적

심플링크 웹투앱배너를 통해서 모바일, 데스크탑 PC의 어떤 디자인의 앱 설치 버튼을 통해서라도 앱 설치를 유도 및 추적할 수 있습니다. 현재 안드로이드, iOS별로 지원되는 현황은 아래와 같습니다.

| 설치된 플랫폼 | 안드로이드 클릭 시 | iOS 클릭 시 |
| -- | -- | -- |
| 데스크탑 PC 웹사이트 | 구글 플레이스토어로 이동 | 구글 플레이스토어로 이동 |
| 모바일 웹사이트 | 구글 플레이스토어로 이동 | iTunes 앱스토어로 이동 |

즉, 모바일 웹사이트에 설치된 배너를 클릭 시 자동으로 플랫폼에 따라서 분기되어 안드로이드일 경우 구글 플레이스토어로 이동하며, iOS일 경우 iTunes 앱스토어로 이동하게 됩니다. 반면 데스크탑에서는 iTunes 앱스토어에서는 앱을 설치할 수 없으므로, 구글 아이디로 로그인 시 자동으로 앱을 설치할 수 있는 구글 플레이스토어로만 일괄 이동하게 됩니다.

(구글 플레이스토어에서의 설치 추적은 데스크탑 PC 웹사이트, 모바일 웹사이트, 모바일 앱 버전 모두에서 지원됩니다.)

설치 방법은 아래와 같이 배너를 적용하고자 하는 버튼의 ID값을 넣는 것으로 가능합니다.

```
// 원하는 앱 설치 버튼을 통한 설치 추적하기 (이 경우 ID가 'download-button-1')
airbridge.setDownload({
  buttonId: "download-button"
}, function(err, res) {
  // callback function
});
```


## 3. 데스크탑 PC에서 설치링크 SMS로 발송

데스크탑 PC에서 앱 설치 버튼을 대체하여서 가장 많이 사용되는 방법인 SMS 발송을 에어브릿지에서 지원합니다. SMS 발송 기능을 구축하기 위해서 들어가는 많은 시간과 노력 대신 단 하나의 매소드 호출만으로도 쉽게 해당 기능을 구현할 수 있습니다.

실제로 구현하는 방법은 아래와 같습니다.

```
// 매소드 호출만으로 쉽게 SMS 발송하기
airbridge.sendSMS({
  phoneNum: document.getElementById("phone-number").value,   // 010-0000-0000
  message: 'ab180 블로그 앱을 다운받아보세요!'
}, function(err, res) {
  // callback function
});
```

## 4. 딥링크를 활용한 사용자 Re-engagement

에어브릿지 WEB SDK는 딥링킹 기능을 지원하며, 앱이 설치된 사용자들을 앱으로 보내기 위한 중계페이지에 사용될 수 있습니다. 딥링크 실행 통계는 기본적으로 `airbridge.init`에서 설정해주신 `defaultChannel`과 `defaultParams`를 기준으로 쌓이게 됩니다.

```
// html
<button id="deeplinking-button-1">앱으로 이동</button>

// js script
// airbridge.init 이후..
airbridge.setDeeplinks({
	deeplinks: {
		ios: "ablog://contents?title=data-science-with-r-2-data-visualization",
		android: "ablog://contents?title=data-science-with-r-2-data-visualization",
		desktop: "http://blog.ab180.co/data-science-with-r-2-data-visualization"
	},
  fallbacks: {
    ios: "http://blog.ab180.co/data-science-with-r-2-data-visualization", // itunes-appstore(default), google-play, custom url
		android: "google-play" // google-play(default), itunes-appstore, custom url
  },
  buttonID: "deeplinking-button-1",
	desktopPopUp: true
})
```

`airbridge.setDeeplinks`에 사용되는 파라미터는 아래와 같습니다.

- `deeplinks`: 필수값. iOS, Android, Desktop 사용자가 어디로 이동할지 지정합니다.
- `buttonID`: 버튼 element의 id를 적어넣으면, 해당 버튼을 클릭했을때 앱으로 이동합니다. 아래 `redirect` 파라미터를 사용하여 자동 redirect을 원하신다면 `buttonID`를 지정하지 않으셔도 됩니다.
- `redirect`: `true`로 설정되면, WEB SDK 스크립트가 로딩되었을 때 자동으로 redirect를 시도합니다. 기본값은 `false`입니다.
- `desktopPopUp`: `true`로 설정되면, 데스크탑 사용자의 경우 웹페이지가 새창에 뜨게됩니다. 기본값은 `false`입니다.
- `fallbacks`: 앱이 설치되어있지 않았을 경우, iOS와 Android의 fallback을 지정합니다. itunes-appstore, google-play 혹은 http, https 형식의 커스텀 URL(custom url)을 지정할 수 있습니다.

## 5. 인앱이벤트 보내기

사용자의 행동 중 알아보고 싶은 행동을 인앱이벤트로 등록하고 얼마나 달성했는지 확인할 수 있습니다.
많은 고객분들이 사용하는 “회원가입”, “로그인”, “장바구니 담기”, “결제”는 기본 인앱이벤트로 별도 매소드가 기본 제공되며,
그 외에도 원하는 인앱이벤트를 등록해 해당 이벤트 달성시 대시보드에서 확인할 수 있습니다.

인앱이벤트 API에 들어가는 모든 파라미터는 **Optional입니다.**

#### 회원가입
```js
airbridge.events.signUp({
    userId: '<사용자 ID>',
    userEmail: '<사용자 이메일>',
    action: '<액션명>',
    label: '<이벤트 라벨>',
});

// ex)
airbridge.events.signUp({ userId: 'ab180' });
```

#### 로그인
```js
airbridge.events.signIn({
    userId: '<사용자 ID>',
    userEmail: '<사용자 이메일>',
    action: '<액션명>',
    label: '<이벤트 라벨>',
});

// ex)
airbridge.events.signIn({ userId: 'ab180' });
```

#### 장바구니
```js
airbridge.events.addToCart({
    products: ?[Product],
    cartId: ?String,
    totalValue: ?Number,
    currency: ?String,
});
```

#### 결제
```js
airbridge.events.purchased({
    products: ?[Product],
    inAppPurchased: ?Boolean,
    totalValue: ?Number,
    currency: ?String,
    transactionId: ?String,
});
```

#### 상품 정보 (`Product`) 형식
```js
const product = {
    id: '?string',
    name: '?string',
    currency: '?string',
    price: '?number',
    quantity: '?number',
    positionInList: '?number',
};

// ex)
const products = [
    { id: '1', name: 'MacBook Pro', price: 1548200, currency: 'KRW' },
    { id: '2', name: 'MacBook Air', price: 999, quantity: 3 },
];
airbridge.events.purchase({ products });
```

## 6. (하이브리드 앱 전용) 디바이스 고유 정보 설정
하이브리드 앱에서 심플링크 WEB SDK를 사용하시는 경우, 디바이스의 고유 ID를 WEB SDK에 설정하면

```js
// For Android
airbridge.setDeviceGAID('GAID');

// For iOS
airbridge.setDeviceIFA('IFA');
airbridge.setDeviceIFV('IFV');
```
