// npm run test - runs all tests
// npm run test routing - runs all tests in the routing category
// npm run test tests/tests/routing - runs all tests in the routing category
// npm run test tests/tests/listen/listen-random.js - runs the test at tests/tests/listen/listen-random.js

const fs = require("fs");
const path = require("path");
const test = require("node:test");
const childProcess = require("node:child_process");
const exec = require("util").promisify(childProcess.exec)
const assert = require("node:assert");

const testPath = path.join(__dirname, 'tests');

let testCategories = fs.readdirSync(testPath).sort((a, b) => parseInt(a) - parseInt(b));
const filterPath = process.argv[2];

if(filterPath) {
    if(!filterPath.endsWith('.js')) {
        testCategories = testCategories.filter(category => category.startsWith(path.basename(filterPath)));
    } else {
        testCategories = [path.dirname(filterPath).split(path.sep).pop()];
    }
}

for (const testCategory of testCategories) {
    test(testCategory, async () => {
        let tests = fs.readdirSync(path.join(__dirname, 'tests', testCategory)).sort((a, b) => parseInt(a) - parseInt(b));
        for (const testName of tests) {
            if(filterPath && filterPath.endsWith('.js')) {
                if(path.basename(testName) !== path.basename(filterPath)) {
                    continue;
                }
            }
            let testPath = path.join(__dirname, 'tests', testCategory, testName);
            let testCode = fs.readFileSync(testPath, 'utf8').replace(`const ws = require("../../../src/index.js");`, 'const ws = require("ws");');
            fs.writeFileSync(testPath, testCode);
            let testDescription = testCode.split('\n')[0].slice(2).trim();
            if(testDescription.endsWith('OFF')) {
                return true;
            }

            await new Promise(resolve => {
                test(testDescription, async () => {
                    let timeout;
                    let timeoutFunc = (module) => {
                        setTimeout(() => process.exit(1));
                        throw `${module} timed out`;
                    };

                    try {
                        timeout = setTimeout(() => timeoutFunc('ws'), 60000);
                        let expressOutput = (await exec(`node ${testPath}`)).stdout;
                        clearTimeout(timeout);

                        fs.writeFileSync(testPath, testCode.replace(`const ws = require("ws");`, `const ws = require("../../../src/index.js");`));
                        timeout = setTimeout(() => timeoutFunc('ultimate-ws'), 60000)
                        let uExpressOutput = (await exec(`node ${testPath}`)).stdout;
                        clearTimeout(timeout);

                        assert.strictEqual(uExpressOutput, expressOutput);
                    } catch (error) {
                        throw error;
                    } finally {
                        clearTimeout(timeout);
                        fs.writeFileSync(testPath, testCode);
                        resolve();
                    }
                });
            });
        }
    });
}