const approvals = require('approvals');

const config = {
    reporters: ['kdiff3'],

    normalizeLineEndingsTo: '\n',
    failOnLineEndingDifferences: true,
    
};

module.exports = () => approvals.mocha(__dirname + '/../approvals').configure(config);