module.exports = {
    '*.{js,css,json,md,ts,tsx,cjs}': (filenames) =>
        filenames.map((filename) => `biome format --write ${filename}`),
    '*.md': (filenames) =>
        filenames.map((filename) => `'markdown-toc -i \"${filename}\"`),
    '*.ts': [
        'npm run style:lint',
        'npm run style:fmt',
        () => 'tsc -p tsconfig.json --noEmit',
    ],
};
