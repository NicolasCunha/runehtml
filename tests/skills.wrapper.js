// Test wrapper for skills.js to make it work with Jest
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and execute the skills.js file in a browser-like environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  runScripts: 'outside-only',
});

const skillsCode = fs.readFileSync(path.join(__dirname, '../js/skills.js'), 'utf8');
dom.window.eval(skillsCode);

export const SkillsSystem = dom.window.SkillsSystem;
export const skillsSystem = dom.window.skillsSystem;
