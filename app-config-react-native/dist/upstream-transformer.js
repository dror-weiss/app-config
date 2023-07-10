"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.upstreamTransformer = void 0;
/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
const semver_1 = require("semver");
const package_json_1 = require("react-native/package.json");
if (!package_json_1.version) {
    throw new Error('Cannot detect React Native version. Module react-native package.json missing version');
}
let transformer;
const reactNativeMinorVersion = (_a = (0, semver_1.parse)(package_json_1.version)) === null || _a === void 0 ? void 0 : _a.minor;
if (!reactNativeMinorVersion) {
    throw new Error(`Failed to parse minor version from React Native version '${package_json_1.version}'`);
}
if (reactNativeMinorVersion >= 59) {
    transformer = require('metro-react-native-babel-transformer');
}
else if (reactNativeMinorVersion >= 56) {
    transformer = require('metro/src/reactNativeTransformer');
}
else if (reactNativeMinorVersion >= 52) {
    transformer = require('metro/src/transformer');
}
else if (reactNativeMinorVersion >= 47) {
    transformer = require('metro-bundler/src/transformer');
}
else if (reactNativeMinorVersion === 46) {
    transformer = require('metro-bundler/build/transformer');
}
else {
    // handle RN <= 0.45
    const legacyUpstreamTransformer = require('react-native/packager/transformer');
    transformer = {
        transform({ src, filename, options }) {
            return legacyUpstreamTransformer.transform(src, filename, options);
        },
    };
}
exports.upstreamTransformer = transformer;
//# sourceMappingURL=upstream-transformer.js.map