REPORTER?=dot
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

test: check-deps
	@./node_modules/mocha/bin/mocha \
		--reporter ${REPORTER} \
		--slow 5000 \
		--timeout 10000 $T

check: test

coverage: check-deps
	@./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha -- -R spec

coverage-html: coverage
	@open coverage/lcov-report/index.html

clean:
	@rm -rf coverage

publish: clean
	@npm -s publish

lint: check-deps
	@./node_modules/.bin/jshint -c ./.jshintrc lib test

check-deps:
	@if test ! -d node_modules; then \
		echo "Installing npm dependencies.."; \
		npm install -d; \
	fi

.PHONY: test dependencies coverage publish clean lint
