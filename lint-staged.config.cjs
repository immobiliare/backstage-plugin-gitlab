module.exports = {
    '*.{js,css,json,md,yaml,yml,ts,tsx,cjs}': ['prettier --write'],
    '*.md': (filenames) =>
        filenames.map((filename) => `'markdown-toc -i \"${filename}\"`),
    '*.ts': [
        'npm run style:lint',
        'npm run style:prettier',
        () => 'tsc -p tsconfig.json --noEmit',
    ],
};
