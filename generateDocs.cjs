const fs = require('fs');
const path = require('path');

const promptPath = 'C:/Users/PC/.gemini/antigravity-ide/brain/acc87a6b-4899-423c-bb7d-9bec84302895/Prompt_Ekstraksi_CP_dan_Pedoman.md';
const alurPath = 'C:/Users/PC/.gemini/antigravity-ide/brain/acc87a6b-4899-423c-bb7d-9bec84302895/Alur_Kerja_Guru.md';

const promptContent = fs.readFileSync(promptPath, 'utf8');
const alurContent = fs.readFileSync(alurPath, 'utf8');

const output = `
export const PROMPT_ADMIN_MD = \`${promptContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;

export const ALUR_GURU_MD = \`${alurContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
`;

fs.writeFileSync(path.join(__dirname, 'src/lib/docsContent.ts'), output);
console.log('Successfully wrote src/lib/docsContent.ts');
