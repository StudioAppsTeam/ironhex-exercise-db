#!/usr/bin/env node
/**
 * set-default-set-type.js
 *
 * Adds default_set_type to every exercise config.json.
 * Exercises in TIME_EXERCISES get "time"; all others get "reps".
 *
 * Usage:
 *   node scripts/set-default-set-type.js
 */

const fs = require('fs');
const path = require('path');

const TIME_EXERCISES = new Set([
  // Isometrics / holds
  'Plank',
  'Side_Bridge',
  'Isometric_Chest_Squeezes',
  'Isometric_Neck_Exercise_-_Front_And_Back',
  'Isometric_Neck_Exercise_-_Sides',
  'Downward_Facing_Balance',
  'Plate_Pinch',
  'Standing_Olympic_Plate_Hand_Squeeze',
  'Crucifix',
  // Carries / loaded walks
  'Farmers_Walk',
  'Yoke_Walk',
  'Rickshaw_Carry',
  // Sustained cardio
  'Bicycling',
  'Bicycling_Stationary',
  'Elliptical_Trainer',
  'Jogging_Treadmill',
  'Prowler_Sprint',
  'Recumbent_Bike',
  'Rope_Jumping',
  'Rowing_Stationary',
  'Running_Treadmill',
  'Skating',
  'Stairmaster',
  'Step_Mill',
  'Trail_Running_Walking',
  'Walking_Treadmill',
]);

const EXERCISES_DIR = path.join(__dirname, '..', 'exercises');

const folders = fs
  .readdirSync(EXERCISES_DIR)
  .filter((name) => fs.statSync(path.join(EXERCISES_DIR, name)).isDirectory())
  .sort();

let updated = 0;
let skipped = 0;

for (const folder of folders) {
  const configPath = path.join(EXERCISES_DIR, folder, 'config.json');
  if (!fs.existsSync(configPath)) {
    skipped++;
    continue;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const desired = TIME_EXERCISES.has(folder) ? 'time' : 'reps';

  if (config.default_set_type === desired) continue;

  config.default_set_type = desired;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  updated++;
}

console.log(`Done. Updated ${updated} config.json files (${skipped} skipped — no config). Total folders: ${folders.length}.`);
