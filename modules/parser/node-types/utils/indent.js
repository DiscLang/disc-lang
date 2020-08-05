function indent(spacing, text) {
    return text
        .split('\n')
        .map(line => spacing + line)
        .join('\n');
}

module.exports = indent;