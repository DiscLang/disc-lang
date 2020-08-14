const programLoader = require('./modules/runtime/programLoader');

if(typeof window === 'object') {
    window.loadAndRunProgram = programLoader.loadAndRun;
    window.lexSource = programLoader.lexSource;
    window.parseSource = programLoader.parseSource;
}