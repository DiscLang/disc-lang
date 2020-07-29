const approvals = require('approvals');

const config = {
    reporters: ['meld'],

    normalizeLineEndingsTo: '\n',
    failOnLineEndingDifferences: true,
    
};

module.exports = () => approvals.mocha(__dirname + '/../approvals').configure(config);