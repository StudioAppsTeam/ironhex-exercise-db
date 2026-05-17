#!/usr/bin/env node
/**
 * build-locale.js <locale>
 *
 * Generates dist/exercises-{locale}.json from the new per-exercise folder structure.
 *
 * Usage:
 *   node scripts/build-locale.js en
 *   node scripts/build-locale.js es
 */

const fs = require('fs');
const path = require('path');

const locale = process.argv[2];
if (!locale) {
  console.error('Usage: node scripts/build-locale.js <locale>');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const EXERCISES_DIR = path.join(ROOT, 'exercises');
const LOCALES_DIR = path.join(ROOT, 'locales');
const DIST_DIR = path.join(ROOT, 'dist');

// Load enum translations for this locale
const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
if (!fs.existsSync(localeFile)) {
  console.error(`Missing locale file: locales/${locale}.json`);
  process.exit(1);
}
const enums = JSON.parse(fs.readFileSync(localeFile, 'utf8'));

// Collect exercise folders (directories only)
const exerciseFolders = fs
  .readdirSync(EXERCISES_DIR)
  .filter((name) => {
    const p = path.join(EXERCISES_DIR, name);
    return fs.statSync(p).isDirectory();
  })
  .sort();

const exercises = [];

for (const folderName of exerciseFolders) {
  const folderPath = path.join(EXERCISES_DIR, folderName);

  const configPath = path.join(folderPath, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.warn(`  SKIP (no config.json): ${folderName}`);
    continue;
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Load locale text — fall back to English if locale file is missing
  const localeTxtPath = path.join(folderPath, `exercise-${locale}.json`);
  const enTxtPath = path.join(folderPath, 'exercise-en.json');
  let txt;
  if (fs.existsSync(localeTxtPath)) {
    txt = JSON.parse(fs.readFileSync(localeTxtPath, 'utf8'));
  } else if (fs.existsSync(enTxtPath)) {
    txt = JSON.parse(fs.readFileSync(enTxtPath, 'utf8'));
  } else {
    console.warn(`  SKIP (no exercise-en.json): ${folderName}`);
    continue;
  }

  // Glob male/female photos, sorted numerically by prefix
  const files = fs.readdirSync(folderPath);
  const malePhotos = files
    .filter((f) => f.endsWith('-male.jpg'))
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((f) => `${folderName}/${f}`);

  const femalePhotos = files
    .filter((f) => f.endsWith('-female.jpg'))
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((f) => `${folderName}/${f}`);

  const entry = {
    id: config.id,
    name: txt.name,
    force: config.force,
    level: config.level,
    mechanic: config.mechanic,
    equipment: config.equipment,
    primaryMuscles: config.primaryMuscles,
    secondaryMuscles: config.secondaryMuscles,
    instructions: txt.instructions,
    category: config.category,
    images_male: malePhotos,
    images_female: femalePhotos,
  };
  if (txt.name_en) entry.name_en = txt.name_en;
  exercises.push(entry);
}

const version = Math.floor(Date.now() / 1000);
const output = { version, locale, enums, exercises };

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

const outFile = path.join(DIST_DIR, `exercises-${locale}.json`);
fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + '\n');
console.log(`Generated dist/exercises-${locale}.json — ${exercises.length} exercises, version ${version}`);
