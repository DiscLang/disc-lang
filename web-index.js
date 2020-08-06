const programLoader = require('./modules/runtime/programLoader');

if(typeof window === 'object') {
    window.loadAndRunProgram = programLoader.loadAndRun;
}