#!/usr/bin/env node
/**
 * setup-new-structure.js
 *
 * Generates the new per-exercise folder structure from existing root JSONs.
 * Run once (or re-run safely — it skips files that already exist).
 *
 * For each exercise:
 *   exercises/{Name}/config.json      — non-translatable metadata
 *   exercises/{Name}/exercise-en.json — English name + instructions
 *   exercises/{Name}/0-male.jpg       — copy of 0.jpg
 *   exercises/{Name}/1-male.jpg       — copy of 1.jpg
 */

const fs = require('fs');
const path = require('path');

const EXERCISES_DIR = path.join(__dirname, '..', 'exercises');

const jsonFiles = fs
  .readdirSync(EXERCISES_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

let created = 0;
let skipped = 0;

for (const jsonFile of jsonFiles) {
  const exerciseId = jsonFile.replace('.json', '');
  const folderPath = path.join(EXERCISES_DIR, exerciseId);
  const jsonPath = path.join(EXERCISES_DIR, jsonFile);

  if (!fs.existsSync(folderPath)) {
    console.error(`  SKIP (no folder): ${exerciseId}`);
    skipped++;
    continue;
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // config.json — everything except name, instructions, images, id (id stays)
  const configPath = path.join(folderPath, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = {
      id: raw.id,
      force: raw.force ?? null,
      level: raw.level,
      mechanic: raw.mechanic ?? null,
      equipment: raw.equipment ?? null,
      primaryMuscles: raw.primaryMuscles ?? [],
      secondaryMuscles: raw.secondaryMuscles ?? [],
      category: raw.category,
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    created++;
  }

  // exercise-en.json — English name + instructions
  const enPath = path.join(folderPath, 'exercise-en.json');
  if (!fs.existsSync(enPath)) {
    const en = {
      name: raw.name,
      instructions: raw.instructions ?? [],
    };
    fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
    created++;
  }

  // Copy 0.jpg → 0-male.jpg, 1.jpg → 1-male.jpg
  for (const n of ['0', '1']) {
    const src = path.join(folderPath, `${n}.jpg`);
    const dst = path.join(folderPath, `${n}-male.jpg`);
    if (fs.existsSync(src) && !fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      created++;
    }
  }
}

console.log(`Done. Created: ${created} files/copies. Skipped (no folder): ${skipped} exercises.`);
