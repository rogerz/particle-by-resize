T = duo-test
TESTS = $(filter-out test/tests.js, $(wildcard test/*.js))
SRC = $(wildcard index.js lib/*.js)

build.js: test/tests.js
	duo --root . --type js --stdout < $< > $@

test/tests.js: $(SRC) $(TESTS)
	@echo '// GENERATED FILE: DO NOT EDIT' > $@
	@$(foreach test, $(TESTS), echo 'require("./$(test)");' >> $@;)

test: test-phantomjs

test-phantomjs: build.js
	@$(T) phantomjs --reporter spec

clean:
	rm -rf test/tests.js build.js components

watch: test
	watch "make test"

.PHONY: clean test watch test-phantomjs