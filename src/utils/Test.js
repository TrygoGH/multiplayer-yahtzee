export class Tests {
    static TYPES = {
        EQUAL: 'assertEqual',
        TRUE: 'assertTrue',
        FALSE: 'assertFalse',
        NOT_NULL: 'assertNotNull',
        THROWS: 'assertThrows',
    };

    static RESULT_CONFIGS = {
        DEFAULT: 'default',
        PASS_ONLY: 'passOnly',
        FAIL_ONLY: 'failOnly',
        SKIP_ONLY: 'skipOnly',
        NONE: 'none',
        NO_PASS: "noPass",
        NO_FAIL: "noFail",
        NO_SKIP: "noSkip",
    };

    static globalShowResultsConfig = {
        showPass: true,
        showFail: true,
        showSkip: true,
    };

    static showResultsDefault = {
        showPass: false,
        showFail: true,
        showSkip: true,
    };

    static showPassOnly = {
        showPass: true,
        showFail: false,
        showSkip: false,
    };

    static showFailOnly = {
        showPass: false,
        showFail: true,
        showSkip: false,
    };

    static showSkipOnly = {
        showPass: false,
        showFail: false,
        showSkip: true,
    };

    static showNone = {
        showPass: false,
        showFail: false,
        showSkip: false,
    };

    static doTests = true;
    static results = [];

    static TestResult = class {
        constructor({ type, message, meta = {} }) {
            this.type = type;
            this.message = message;
            this.meta = meta;
        }

        print() {
            const method = this[`print_${this.type}`] || this.print_default;
            method.call(this);
        }

        print_default() {
            throw new Error('Subclasses must implement print_default');
        }
    };

    static Pass = class extends Tests.TestResult {
        print() {
            const method = this[`print_${this.type}`] || this.print_default;
            method.call(this);
        }

        print_default() {
            console.log(`✅ PASS [${this.type}]: ${this.message}`);
        }

        print_assertEqual() {
            console.log(`✅ PASS [Equal]: ${this.message}`);
        }

        print_assertTrue() {
            console.log(`✅ PASS [True]: ${this.message}`);
        }

        print_assertFalse() {
            console.log(`✅ PASS [False]: ${this.message}`);
        }

        print_assertNotNull() {
            console.log(`✅ PASS [NotNull]: ${this.message}`);
        }

        print_assertThrows() {
            console.log(`✅ PASS [Throws]: ${this.message}`);
        }
    };

    static Fail = class extends Tests.TestResult {
        print() {
            const method = this[`print_${this.type}`] || this.print_default;
            method.call(this);
        }

        print_default() {
            console.error(`❌ FAIL [${this.type}]: ${this.message}`);
        }

        print_assertEqual() {
            console.error(`❌ FAIL [Equal]: ${this.message}`);
            console.error(`   Expected: ${this.meta.expected}, but got: ${this.meta.actual}`);
        }

        print_assertTrue() {
            console.error(`❌ FAIL [True]: ${this.message}`);
            console.error(`   Expected: true, but got: ${this.meta.value}`);
        }

        print_assertFalse() {
            console.error(`❌ FAIL [False]: ${this.message}`);
            console.error(`   Expected: false, but got: ${this.meta.value}`);
        }

        print_assertNotNull() {
            console.error(`❌ FAIL [NotNull]: ${this.message}`);
            console.error(`   Value is null or undefined`);
        }

        print_assertThrows() {
            console.error(`❌ FAIL [Throws]: ${this.message}`);
            console.error(`   Expected function to throw, but it did not.`);
        }
    };

    static Skip = class extends this.TestResult {
        print_default() {
            console.log(`⚠️ SKIPPED [${this.type}]: ${this.message}`);
        }
    };

    // === New Test Class ===

    static Test = class {
        constructor({ type, message, meta = {}, skip = false, showResults = Tests.showResultsDefault }) {
            this.type = type;
            this.message = message;
            this.meta = meta;
            this.showResults = showResults;
            this.result = null;
            this.skip = skip;
        }

        run() {
            if (!Tests.doTests) return null;

            if (this.skip) {
                this.result = new Tests.Skip(this);
                Tests.results.push(this.result);
                if (this.showResults.showSkip) this.result.print();
                return this.result;
            }

            const { type, meta } = this;

            switch (type) {
                case Tests.TYPES.EQUAL:
                    this.result = meta.actual === meta.expected
                        ? new Tests.Pass(this)
                        : new Tests.Fail(this);
                    break;

                case Tests.TYPES.TRUE:
                    this.result = meta.value === true
                        ? new Tests.Pass(this)
                        : new Tests.Fail(this);
                    break;

                case Tests.TYPES.FALSE:
                    this.result = meta.value === false
                        ? new Tests.Pass(this)
                        : new Tests.Fail(this);
                    break;

                case Tests.TYPES.NOT_NULL:
                    this.result = meta.value != null
                        ? new Tests.Pass(this)
                        : new Tests.Fail(this);
                    break;

                case Tests.TYPES.THROWS:
                    let threw = false;
                    if (typeof meta.fn !== 'function') {
                        throw new Error('Test of type THROWS requires meta.fn to be a function');
                    }
                    try {
                        meta.fn();
                    } catch {
                        threw = true;
                    }
                    this.result = threw
                        ? new Tests.Pass(this)
                        : new Tests.Fail(this);
                    break;
                default:
                    throw new Error(`Unknown test type: ${type}`);
            }

            Tests.results.push(this.result);
            const localShouldPrint = Tests.shouldPrintResult(this.result, this.showResults);
            const globalShouldPrint = Tests.shouldPrintResult(this.result, Tests.globalShowResultsConfig);
            if (localShouldPrint && globalShouldPrint) this.result.print();

            return this.result;
        }
    };

    // === Static Helper Functions ===

    static assertEqual({ message, actual, expected, showResults = this.showResultsDefault, skip = false }) {
        return new this.Test({
            type: this.TYPES.EQUAL,
            message,
            meta: { actual, expected },
            showResults,
            skip
        }).run();
    }

    static assertTrue({ message, value, showResults = this.showResultsDefault, skip = false }) {
        return new this.Test({
            type: this.TYPES.TRUE,
            message,
            meta: { value },
            showResults,
            skip
        }).run();
    }

    static assertFalse({ message, value, showResults = this.showResultsDefault, skip = false }) {
        return new this.Test({
            type: this.TYPES.FALSE,
            message,
            meta: { value },
            showResults,
            skip
        }).run();
    }

    static assertNotNull({ message, value, showResults = this.showResultsDefault, skip = false }) {
        return new this.Test({
            type: this.TYPES.NOT_NULL,
            message,
            meta: { value },
            showResults,
            skip
        }).run();
    }

    static assertThrows({ message, fn, showResults = this.showResultsDefault, skip = false }) {
        return new this.Test({
            type: this.TYPES.THROWS,
            message,
            meta: { fn },
            showResults,
            skip
        }).run();
    }


    static summary() {
        const totalCount = this.results.length;
        const passCount = this.results.filter(result => result instanceof this.Pass).length;
        const skipCount = this.results.filter(result => result instanceof this.Skip).length;
        const failCount = this.results.filter(result => result instanceof this.Fail).length;
        console.log(`\n=== Test Summary ===`);
        console.log(`🔢 Total: ${totalCount}`);
        console.log(`✅ Passed: ${passCount}`);
        console.log(`⚠️ Skipped: ${skipCount}`);
        console.log(`❌ Failed: ${failCount}`);
    }

    static shouldPrintResult(result, showConfig) {
        const config = {
            showPass: !!showConfig?.showPass,
            showFail: !!showConfig?.showFail,
            showSkip: !!showConfig?.showSkip,
        };

        if (result instanceof this.Pass && config.showPass) return true;
        if (result instanceof this.Fail && config.showFail) return true;
        if (result instanceof this.Skip && config.showSkip) return true;

        return false;
    }


    static printAll() {
        for (const result of this.results) {
            if (Tests.shouldPrintResult(result, Tests.globalShowResultsConfig)) result.print();
        }
    }

    static getResultConfig(configName) {
        let newConfig;
        switch (configName) {
            case this.RESULT_CONFIGS.DEFAULT:
                newConfig = { ...this.showResultsDefault };
                break;
            case this.RESULT_CONFIGS.FAIL_ONLY:
                newConfig = { ...this.showFailOnly };
                break;
            case this.RESULT_CONFIGS.SKIP_ONLY:
                newConfig = { ...this.showSkipOnly };
                break;
            case this.RESULT_CONFIGS.PASS_ONLY:
                newConfig = { ...this.showPassOnly };
                break;
            case this.RESULT_CONFIGS.NO_SKIP:
                newConfig = { ...this.showResultsDefault };
                break;
            case this.RESULT_CONFIGS.NO_PASS:
                newConfig = { ...this.showResultsDefault };
                break;
            case this.RESULT_CONFIGS.NO_FAIL:
                newConfig = { ...this.showResultsDefault };
                break;
            case this.RESULT_CONFIGS.NONE:
                newConfig = { ...this.showNone };
                break;

            default:
                newConfig = { ...this.showResultsDefault };
                break;
        }
    }

}
