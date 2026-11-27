import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(path.join(process.env.CI_BABEL_DIR, 'package.json'));
const babel = require('@babel/core');
const amdPlugin = require('@babel/plugin-transform-modules-amd');
const compileAmd = async (source, component, module) => babel.transformSync(source, {
    babelrc: false, configFile: false,
    moduleIds: true, moduleId: `${component}/${module}`,
    plugins: [amdPlugin],
});

const plugin = fileURLToPath(new URL('../../', import.meta.url));
const prefix = 'local_availabilityhelper/';
const tests = ['analyzer.test', 'scenarios.test', 'branches.test'];
const production = ['rules', 'relations', 'model', 'analyzer', 'scenarios', 'branches'];
const subset = Symbol('arrayContaining');
const expect = actual => ({
    toBe: expected => assert.equal(actual, expected),
    toBeLessThan: expected => assert.ok(actual < expected),
    toContain: item => assert.ok(actual.includes(item)),
    toContainEqual: item => assert.ok(actual.some(value => isDeepStrictEqual(value, item))),
    toEqual: expected => expected?.[subset] ?
        assert.ok(expected[subset].every(item => actual.some(value => isDeepStrictEqual(value, item)))) :
        assert.deepEqual(actual, expected),
    toHaveLength: expected => assert.equal(actual.length, expected),
});
expect.arrayContaining = array => ({[subset]: array});

for (const built of [false, true]) {
    const modules = new Map();
    let passed = 0;
    const context = vm.createContext({
        define(id, dependencies, factory) {
            const exports = {};
            const args = dependencies.map(dependency => {
                if (dependency === 'exports') {
                    return exports;
                }
                const resolved = dependency.startsWith('./') ? prefix + dependency.slice(2) : dependency;
                assert.ok(modules.has(resolved), 'Missing module ' + resolved);
                return modules.get(resolved);
            });
            modules.set(id, factory(...args) ?? exports);
        },
        describe: (name, fn) => fn(),
        it: (name, fn) => {
            fn();
            console.log('PASS ' + name);
            passed++;
        },
        expect,
    });
    for (const module of [...production, ...tests]) {
        const sourceDirectory = tests.includes(module) ? 'tests/js' : 'amd/src';
        const code = built && production.includes(module) ?
            await readFile(path.join(plugin, 'amd/build', module + '.min.js'), 'utf8') :
            (await compileAmd(await readFile(path.join(plugin, sourceDirectory, module + '.js'), 'utf8'),
                prefix.slice(0, -1), module)).code;
        new vm.Script(code, {filename: module + '.js'}).runInContext(context);
    }
    console.log((built ? 'Built AMD' : 'Source') + ': ' + passed + ' passed.');
}
