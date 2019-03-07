# Airbridge Web SDK

```
// load airbridge websdk script (necessary)
(function(a_,i_,r_,_b,_r,_i,_d,_g,_e){if(!a_[_b]||!a_[_b].queue){_g=i_.getElementsByTagName(r_)[0];a_[_b]={queue:[]};_d={};for(_i=0;_i<_r.length;_d={m:_d.m},_i++)_d.m=_r[_i],~_d.m.indexOf(".")&&(_e=_d.m.split(".")[0],a_[_b][_e]=a_[_b][_e]||{},a_[_b][_e][_d.m.split(".")[1]]=function(_d){return function(){a_[_b].queue.push([_d.m,arguments])}}(_d)),a_[_b][_d.m]=function(_d){return function(){a_[_b].queue.push([_d.m,arguments])}}(_d);_d=i_.createElement(r_);_d.async=1;_d.src="//static.airbridge.io/sdk/latest/airbridge.min.js";_g.parentNode.insertBefore(_d,_g)}})(window,document,"script","airbridge","init setBanner setDownload setDeeplinks sendSMS sendWeb setUserAgent setUserId setUserEmail setDeviceIFV setDeviceIFA setDeviceGAID events.send events.signIn events.signUp events.signOut events.purchased events.addedToCart events.productDetailsViewEvent events.homeViewEvent events.productListViewEvent events.searchResultViewEvent".split(" "));

// initialize (necessary)
airbridge.init({
  app: '%app_name%',
  appToken: '%app_token%'
})
```

[WEB SEK Script Generator](http://static.airbridge.io/sdk/generator/index.html?app_name=airbridge)

## Install
```
$ npm install -g grunt-cli
$ npm install
$ brew install wget
$ make closure-compiler
$ make closure-library
```

## Run
```
$ make test
$ npm run dev
```


## Release

```
$ make release-dev
$ make release-real
```

## Release Process

### 1.Jenkins CI (Release)

* when code merged, jenkinsCI works automatically
* Go [Jenkins](http://ci.ab180.co/job/airbridge-websdk/)
* Check the `Build History` is updated
  * If it failed to release, move to airbridge-websdk and click the `Build Now`

### 2.CloudFront Cache Invalidation (Refresh)

* Go [CloudFront Distribution > E5RD0OMGQ3WT1](https://console.aws.amazon.com/cloudfront/home?region=ap-northeast-1#distribution-settings:E5RD0OMGQ3WT1)
* Create Invalidation `/sdk/latest/airbridge.min.js`
* Go [airbridge.min.js](http://static.airbridge.io/sdk/latest/airbridge.min.js)
	* search `sdkConfig.version=` to check the version is changed

### 3. Go Customer Site (Check SDK version)

- Go [Customer Site](https://baemin.com)
- Input `airbridge` at the console window
- Click `__proto__` to check the version is changed

### 4. Monitoring system

* Go [Kibana](http://1984.monitoring.ab180.co:5601/app/kibana#/visualize/edit/4cd09530-1f9f-11e9-a2fe-8fe5a86048d8)
* Check Point
	* **SDK Version Traffic** (is it working well with a new version?)
	* **앱별** (if the graph is suddenly falling down need to check!)
	* **200이 아닌 Response 수** (if response number is the high need to check!)

### 5. Notify to CS team

```
[이슈현상]
[원인분석]
[해결방안]

with intercom link
https://app.intercom.io/a/apps/zbrympfa/conversations/19864226832?redirectTo=feed
```
### 6.release note update
1. [release before](https://docs.google.com/spreadsheets/d/1che0ZGSQYM6XFj3P57cmfhlx_Jh_4H-PMmv3BDdam4o/edit#gid=556726439)

2. [release note (git)](https://github.com/ab180/airbridge-websdk/blob/master/RELEASE.md)

3. [update change log (google drive)](https://drive.google.com/drive/u/0/folders/1uavnMBOfH5LCoR5uhsd1hbGINfnKQP8o)

## Features

#### Download Button
```
// download button
airbridge.setDownload({
  buttonId: "download-button-1"
});

// multiple download buttons
airbridge.setDownload({
  buttonId: ["download-button-1", "download-button-2"]
});
```

#### Deeplink Button
```
// deeplink button
airbridge.setDeeplinks({
  deeplinks: {
      ios: "app://ios",
      android: "app://android",
      desktop: "http://airbridge.io"
  },
  buttonID: "deeplinking-button-1",
  desktopPopUp: true,
})

// multiple deeplink buttons
airbridge.setDeeplinks({
  deeplinks: {
      ios: "app://ios",
      android: "app://android",
      desktop: "http://airbridge.io"
  },
  buttonID: ["deeplinking-button-1", "deeplinking-button-2"],
  desktopPopUp: true,
})

// web fallbacks (if deeplink failed)
airbridge.setDeeplinks({
  deeplinks: {
      ios: "app://ios",
      android: "app://android",
      desktop: "http://airbridge.io"
  },
  fallbacks: {
    ios: "http://airbridge.io",
    android: "http://airbridge.io"
  },
  buttonID: "deeplinking-button-1",
  desktopPopUp: true,
})

// auto redirect
airbridge.setDeeplinks({
  deeplinks: {
      ios: "app://ios",
      android: "app://android",
      desktop: "http://airbridge.io"
  },
  fallbacks: {
    ios: "http://airbridge.io",
    android: "google-play"
  },
  redirect: true
})
```

### Tracking In-App Conversion with WEB SDK

```
// initialize (necessary)
airbridge.init({
    app: 'ablog',
    appToken: '38acf1efa9fc4f0987173f5a76516eb1',
    mobileApp: {
        deviceUUID: 'b3af045d-c6a9-47a3-b37c-8d9d4727228f',
        packageName: 'io.airbridge'
    }
})
```

### Dynamic url query parameter tracking
Map `DMCOL` to `term` and `DMSKW` to `sub_id_1` when landing url is `https://airbridge.io?DMCOL=MOBILESA&DMSKW=keyword`
```
// initialize (necessary)
airbridge.init({
    app: 'ablog',
    appToken: '38acf1efa9fc4f0987173f5a76516eb1',
    urlQueryMapping: {
        'sub_id_1': 'DMSKW',
        'term': 'DMCOL',
    }
})
```
