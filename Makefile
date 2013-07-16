REPORTER?=progress
ifdef V
	REPORTER=spec
endif

ifdef TEST
	T=--grep '${TEST}'
	REPORTER=list
endif

dependencies:
	@npm install -s -d

deps: dependencies

test:
	@./node_modules/mocha/bin/mocha \
		--reporter ${REPORTER} \
		--slow 2000 \
		--timeout 10000 $T

check: test

coverage: lib-cov
	@JS_COV=1 ./node_modules/mocha/bin/mocha \
		--timeout 10000 --reporter html-cov > coverage.html
	@rm -rf *-cov
	@open coverage.html

lib-cov:
	@which jscoverage &> /dev/null || \
		(echo "jscoverage is required - see the README" && exit 1);
	@rm -rf lib-cov
	@jscoverage lib lib-cov

clean:
	@rm -rf coverage.html lib-cov

publish: clean
	@npm -s publish

.PHONY: test dependencies coverage publish clean
