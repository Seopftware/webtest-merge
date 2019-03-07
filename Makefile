##############################################
# AIRBRIDGE WEB SDK MAKEFILE
##############################################
PYTHON=python
COMPILER=java -jar compiler/compiler.jar
COMPILER_LIBRARY=compiler/library/closure-library-master/closure
EXTERN=src/extern.js

# Configs
PROD_CONFIG=src/config/production.js
DEV_CONFIG=src/config/development.js
LOCAL_DEV_CONFIG=src/config/local_development.js
COMPILER_LOCAL_DEV_ARGS=--js $(LOCAL_DEV_CONFIG) $(SOURCES) --externs $(EXTERN) --output_wrapper "(function() {%output%})();" --dependency_mode=STRICT --entry_point=airbridge_instance
COMPILER_DEV_ARGS=--js $(DEV_CONFIG) $(SOURCES) --externs $(EXTERN) --output_wrapper "(function() {%output%})();" --dependency_mode=STRICT --entry_point=airbridge_instance
COMPILER_PROD_ARGS=--js $(PROD_CONFIG) $(SOURCES) --externs $(EXTERN) --output_wrapper "(function() {%output%})();" --dependency_mode=STRICT --entry_point=airbridge_instance
#COMPILER_MIN_ARGS=--compilation_level ADVANCED --define 'DEBUG=false' # error
COMPILER_MIN_ARGS=--define 'DEBUG=false'
COMPILER_DEBUG_ARGS=--formatting=print_input_delimiter --formatting=pretty_print --warning_level=VERBOSE --define 'DEBUG=true'

# Targets
SOURCES=src/0_config.js\
src/1_ua_parser.js\
src/2_utils.js\
src/3_launcher.js\
src/4_http.js\
src/5_banner.js\
src/6_airbridge.js\
src/8_deeplink.js\
src/9_inapp_events.js\
src/7_initialization.js

TEST_SOURCES=test/1_test-init.js\
test/2_test-setBanner.js\
test/3_test-sendSMS.js\
test/4_test-setDownload.js\
test/6_test-setDeeplinks.js\
test/test_template.html

all: dist/airbridge.js dist/airbridge.min.js test/airbridge-deps.js transform-pretty

clean:
	rm -rf dist/* test/airbridge-deps.js test/test.html

# Script for local development mode
#dist/airbridge.local.min.js: $(LOCAL_DEV_CONFIG) $(SOURCES) compiler/compiler.jar
#	$(COMPILER) $(COMPILER_LOCAL_DEV_ARGS) $(COMPILER_DEBUG_ARGS) > dist/airbridge.local.min.js
dist/airbridge.local.min.js: $(DEV_CONFIG) $(SOURCES) compiler/compiler.jar
	$(COMPILER) $(COMPILER_DEV_ARGS) $(COMPILER_DEBUG_ARGS) > dist/airbridge.local.min.js

# Script for development mode
dist/airbridge.dev.min.js: $(DEV_CONFIG) $(SOURCES) compiler/compiler.jar
	$(COMPILER) $(COMPILER_DEV_ARGS) $(COMPILER_MIN_ARGS) > dist/airbridge.dev.min.js

# Script for production mode
dist/airbridge.min.js: $(PROD_CONFIG) $(SOURCES) compiler/compiler.jar
	$(COMPILER) $(COMPILER_PROD_ARGS) $(COMPILER_MIN_ARGS) > dist/airbridge.min.js

# download and unzip latest closure compiler
# compiler file should have name as compiler.jar 
closure-compiler:
	mkdir -p compiler && \
		wget http://dl.google.com/closure-compiler/compiler-latest.zip && \
		unzip compiler-latest.zip -d compiler && \
		rm -f compiler-latest.zip
	mv compiler/closure-compiler*.jar compiler/compiler.jar

# download and unzip latest closure library
closure-library:
	mkdir -p compiler/library && \
		wget https://github.com/google/closure-library/archive/master.zip && \
		unzip master.zip -d compiler/library && \
		rm -f master.zip

# caculate dependency
test/airbridge-deps.js: $(SOURCES) compiler/library
	@rm test/airbridge-deps.js.tmp
	python $(COMPILER_LIBRARY)/bin/calcdeps.py \
		--dep $(COMPILER_LIBRARY)/goog \
		--path src \
		--path test \
		--output_mode deps \
		--exclude test/airbridge-deps.js > test/airbridge-deps.js.tmp
	echo "// jscs:disable" | cat - test/airbridge-deps.js.tmp | sed -e 's#src/0_config.js#test/web-config.js#' > test/airbridge-deps.js

# [중요] 에어브릿지 대시보드에서 사용하는 script text file 만들기
script:
	@rm -rf dist/import.js dist/script.txt
	$(COMPILER) --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	tr -d '\n' < dist/import.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" src/script_template.txt \
		| sed "s/{{SCRIPT_SOURCE}}/\/\/static.airbridge.io\/sdk\/latest\/airbridge.min.js/g" > dist/script.txt

script-deploy: script
	aws s3 cp dist/script.txt s3://udl-static/sdk/dist/script.txt --exclude '.DS_Store' --acl public-read

# 현재 개발중인 소스를 테스트하기 위한 명령여 > test/test.html에 개발중인 소스가 로드됩니다.
test: $(TEST_SOURCES) test/airbridge-deps.js dist/airbridge.local.min.js
	@rm -rf dist/import.js dist/import_tmp.js dist/import_without_newline.js test/test.html
	$(COMPILER) --formatting=pretty_print --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	@cat dist/import.js
	awk 'NR > 1{print line" \\"}{line=$$0;}END{print $$0" "}' dist/import.js > dist/import_tmp.js
	tr -d '\n' < dist/import_tmp.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" test/test_template.html \
		| sed "s/{{SCRIPT_SOURCE}}/\.\.\/dist\/airbridge.local.min.js/g" > test/test.html

# dev에 올라가있는 소스를 테스트하기 위한 명령어 > test/test.html에 배포되어있는 소스가 로드됩니다.  
test-dev: test/airbridge-deps.js dist/airbridge.dev.min.js
	@rm -rf dist/import.js test/test.html
	$(COMPILER) --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	tr -d '\n' < dist/import.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" test/test_template.html \
		| sed "s/{{SCRIPT_SOURCE}}/http:\/\/static.airbridge.io\/sdk\/dist\/airbridge.dev.min.js/g" > test/test.html

# production에 올라가있는 소스를 테스트하기 위한 명령어 > test/test.html에 배포되어있는 소스가 로드됩니다.  
test-real: test/airbridge-deps.js dist/airbridge.min.js
	@rm -rf dist/import.js test/test.html
	$(COMPILER) --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	tr -d '\n' < dist/import.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" test/test_template.html \
		| sed "s/{{SCRIPT_SOURCE}}/http:\/\/static.airbridge.io\/sdk\/latest\/airbridge.min.js/g" > test/test.html

# deploy하면 dist에 airbridge.min.js와 test suite들이 들어있는 test.html를 배포
release-dev: dist/airbridge.dev.min.js script
	@rm -rf dist/import.js test/test.html
	$(COMPILER) --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	tr -d '\n' < dist/import.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" test/test_template.html \
		| sed "s/{{SCRIPT_SOURCE}}/\/\/s3-ap-northeast-1.amazonaws.com\/udl-static\/sdk\/dist\/airbridge.dev.min.js/g" > test/test.html
	aws s3 sync dist/ s3://udl-static/sdk/dist/ --exclude '.DS_Store' --acl public-read --delete
	aws s3 sync src/ s3://udl-static/sdk/src --exclude '*.js' --exclude '.DS_Store' --include 'config/production.js' --include 'config/development.js' --include 'config/local_development.js' --include '1_ua_parser.js' --include '2_utils.js' --delete
	aws s3 sync test/ s3://udl-static/sdk/test --exclude '.DS_Store' --acl public-read --delete

# release시에는 deploy하고 테스팅 성공시 latest에 release 되어야 함
release-real: dist/airbridge.min.js script
	#mocha-phantomjs -p $(which phantomjs) --ignore-resource-errors 'http://s3-ap-northeast-1.amazonaws.com/udl-static/sdk/test/test.html' --ignore-ssl-errors=true # test code
	@rm -rf dist/import.js test/test.html
	$(COMPILER) --js src/onpage.js | node compiler/transform.js a_,i_,r_,_b,_r,_i,_d,_g,_e > dist/import.js
	tr -d '\n' < dist/import.js | sed 's/\&/\\\&/g' > dist/import_without_newline.js
	sed "s/\/\/INSERT CODE SNIPPETS/$$(cat dist/import_without_newline.js)/g" test/test_template.html \
		| sed "s/{{SCRIPT_SOURCE}}/\/\/static.airbridge.io\/sdk\/latest\/airbridge.min.js/g" > test/test.html
	aws s3 cp --content-type="application/javascript" dist/airbridge.min.js s3://udl-static/sdk/latest/airbridge.min.js --acl public-read

