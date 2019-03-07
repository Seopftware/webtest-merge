# v1.6.9
- Allow multiple button ID on setDeeplinks, setDownload
- Pass airbridge_referrer parameter to Android market:// deeplink
- Change configuration of development script to production's one

# v1.7.2
update date: 181206 (merge: #8)
- Change input parameter null to "" on signOut
- Change parameter on setDownloadButtons to get callback data in multiple button ID
- Delete downloadCompletedCallback parameter (unused)

# v1.7.3
update date: 181221 (merge: #10)
- gsshop redirect시 airbridge_referrer 잘못보내는 파라미터 받을 수 있게 수정
- gsshop 파라미터 동적 파싱 기능
- url query mapping 옵션 추가
- short url 관련 로직 업데이트

# v1.7.4
update date: 181228 (merge: #11)
- utm parsing priority 조정
- user attributes를 추가 전송 할 수 있는 기능이 추가

# v1.7.5
update date: 181228 (merge: #12)
- utm parsing pritority 낮은 경우 shortId 초기화

# v1.7.6
update date: 190104 (merge: #13)
- subdomain에서도 쿠키 공유가 가능한 옵션 기능 추가

# v1.7.7
update date: 190110 (merge: #14)
- setUserPhone 추가

# v1.7.8
update date: 190114 (merge: #15)
- lookbackWindowInMinutes 옵션 추가 (쿠키 분단위 설정 가능)

# v1.7.9
update date: 190117 (merge: #16)
- lookbackWindowInMinutes 이름을 cookieWindowInMinutes로 변경
- lookbackWindow 이름을 cookieWindow로 변경

# v1.7.10
update date: 190123 (merge: #17)
- root path에 쿠키 저장

# v1.7.11
update date: 190124 (merge: #18)
- urlQueryMapping에 list(object) 받아서 파라미터 우선순위 정할 수 있도록 옵션 제공

# v1.7.12
update date: 190128 (merge: #24)
- utm_source가 있는 URL에서 utm이 없는 URL로 이동할 때, airbridge_sid가 같은 상황에서는 쿠키가 업데이트 되지 않게 처리

# v1.7.13
update date: 190219 (merge: #33)
- event payload에 utmPasing:Boolean 옵션이 추가되었습니다. (#25)
- simplelink data의 channel 값을 체크하는 로직이 강화되었습니다. (#27)

# v1.7.14
update date: 190220 (merge: #36)
- event payload의 utmParsing이 utmPassed로 변경되었습니다.