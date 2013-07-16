REPORTER?=progress
ifdef V
	REPORTER=spec
endif

ifdef TEST
	T=--grep '${TEST}'
	REPORTER=list
endif

dependencies:
	npm install -s -d

deps: dependencies

test:
	@./node_modules/mocha/bin/mocha \
		--reporter ${REPORTER} \
		-s 200 \
		-t 2000 $T

check: test

coverage: lib-cov
	@JS_COV=1 ./node_modules/mocha/bin/mocha \
		--reporter html-cov > coverage.html
	@rm -rf *-cov
	@open coverage.html

lib-cov:
	@which jscoverage &> /dev/null || \
		(echo "jscoverage is required - see the README" && exit 1);
	@rm -rf lib-cov
	@jscoverage lib lib-cov

.PHONY: test dependencies coverage
