Airbridge Web SDK QA Spec
=======

#### 테스트 대상
WebSDK QA 페이지 [http://static.airbridge.io/sdk/test/qa.html](http://static.airbridge.io/sdk/test/qa.html) 를 통해 주어진 시나리오대로 Web SDK가 동작하는지 검증합니다.

#### 테스트 환경

 * Internet Explorer (9+)
 * Google Chrome
 * Safari
 * iOS (딥링크 테스트만 수행)
 * Android (딥링크 테스트만 수행)

#### 이벤트 조회 방법

 1. Aerospike에 접속해서 조회
    1. Aerospike에 접속합니다. (커맨드 : `aql -h 001.clusters.aerospike.admin.ab180.co`)
    2. 웹페이지에서 Client ID 값을 복사합니다.
    3. `SELECT * FROM airbridge.tbl_sl_stats_web WHERE client_id="<ClientID값>"`을 통해 이 컴퓨터에서 보낸 웹 이벤트들을 조회할 수 있습니다.
 2. 대시보드에 접속해서 조회
    1. [Airbridge Blog 대시보드](https://airbridge.io/d/#/app/ablog)에 접속합니다.
    2. 좌측 "WEBSDK 인앱이벤트" 리포트에서, `20180102-websdk-qa` 캠페인에 해당하는 인앱이벤트를 확인할 수 있습니다.
 3. 재플린 노트북에서 조회
    1. [재플린 노트북](http://zeppelin.airbucket.ab180.co/#/notebook/2D2W1J71P) 접속

#### 테스트 시나리오

 1. **기본 동작 검증 테스트**
    * 웹페이지를 열었을 때
      * 상단에 에어배너가 표시되는지 확인합니다.
      * 에어배너에 "에어브릿지 블로그" 아이콘이 표시되는지 확인합니다.
      * Client ID가 표시되는지 확인합니다. (console)
      * hyojun@ab180.co 이메일로 로그인 (signIn) 이벤트가 전송되었는지 확인합니다.
        * Query : `SELECT ext_user_email, goal_category, requested_at FROM airbridge.tbl_sl_stats_web WHERE client_id="<ClientID값>"`
    * 같은 브라우저에서 2차 테스트 페이지 (therne.me/sdk_qa.html)를 열었을 때
      * Client ID가 위 테스트에서와 **동일한지** 확인합니다.

 2. **User Email 정보 수정 테스트**
    * User Email 필드를 임의의 값으로 수정합니다.
    * 파라미터 업데이트 버튼을 누릅니다.
    * "회원가입" 버튼을 누릅니다.
    *  해당 변경된 이메일로 로그인 (signIn) 이벤트가 전송되었는지 확인합니다.
      * Query : `SELECT ext_user_email, goal_category, requested_at FROM airbridge.tbl_sl_stats_web WHERE client_id="<ClientID값>"`

 3. **GAID 정보 수정 테스트**
    * GAID 필드에 임의의 값을 넣습니다.
    * 파라미터 업데이트 버튼을 누릅니다.
    * "회원가입" 버튼을 누릅니다.
    *  해당 GAID로 로그인 (signIn) 이벤트가 전송되었는지 확인합니다.
      * Query : `SELECT device_uuid, goal_category, requested_at FROM airbridge.tbl_sl_stats_web WHERE client_id="<ClientID값>"`

 4. **인앱이벤트 테스트**
    * 장바구니 버튼을 눌렀을 때
      * 장바구니 담기 (addedToCart) 이벤트가 전송되었는지 확인합니다.
    * 구매 버튼을 눌렀을 때
      * 구매 (purchased) 이벤트가 전송되었는지 확인합니다.
    * Custom 인앱이벤트
      * console 창을 열고, `airbridge.events.send("custom_goal", {"label": "custom_label", "action": "custom_action", "value": 0, "customAttributes": {}})`를 입력합니다.
      * custom 이벤트가 전송되었는지 확인합니다.

 5. **딥링크 테스트**
    * (iOS, 앱 삭제 후 진행) Ablog 앱 열기 버튼을 눌렀을 때
      * App Store로 가는지 확인합니다.
      * 앱을 설치 후, 다시 클릭했을 때 블로그 앱으로 가는지 확인합니다.
      * `20180102-websdk-qa` 캠페인에 대해 딥링크 설치 통계가 1 적재되는지 확인합니다.
    * (Android, 앱 삭제 후 진행) Ablog 앱 열기 버튼을 눌렀을 때
      * Play Store로 가는지 확인합니다.
      * 앱을 설치 후, 계속 버튼을 클릭했을 때 Sigong 페이지로 가는지 확인합니다.
      * `20180102-websdk-qa` 캠페인에 대해 딥링크 설치 통계가 1 적재되는지 확인합니다.
    * (Desktop) Ablog 앱 열기 버튼을 눌렀을 때
      * 블로그 웹 페이지가 새 창에서 열리는지 확인합니다.

 6. **에어배너 테스트**
    * 핸드폰번호를 입력한 후 앱설치링크 보내기 버튼을 눌렀을 때
      * 해당 번호로 설치 링크가 가는지 확인합니다.
