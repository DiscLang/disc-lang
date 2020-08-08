function promisifyResult(result) {
    if (typeof result === 'object' && typeof result.then === 'function') {
        return result;
    } else {
        return Promise.resolve(result);
    }
}

function promisifyExec(node, scope) {
    return promisifyResult(node.execute(scope));
}

module.exports = {
    promisifyExec,
    promisifyResult
};