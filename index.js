#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const programLoader = require('./modules/runtime/programLoader');

const sourceFileName = process.argv.slice(2)[0];

function loadSource(fileName) {
    const filePath = path.join(process.cwd(), fileName);
    return fs.readFileSync(filePath, { encoding: 'utf8' });
}

const programSource = loadSource(sourceFileName);

programLoader.loadAndRun(programSource, {
    promptSync: require('prompt-sync'),
    clear: require('clear')
});