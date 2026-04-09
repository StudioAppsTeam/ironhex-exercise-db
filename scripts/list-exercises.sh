#!/bin/bash

EXERCISES_FILE="dist/exercises.json"
OUTPUT_FILE="scripts/exercises-report.txt"

{
  echo "=== TOTAL ==="
  jq '.exercises | length' $EXERCISES_FILE

  echo ""
  echo "=== BY CATEGORY ==="
  jq -r '.exercises[].category' $EXERCISES_FILE | sort | uniq -c | sort -rn

  echo ""
  echo "=== BY PRIMARY MUSCLE ==="
  jq -r '.exercises[].primaryMuscles[]' $EXERCISES_FILE | sort | uniq -c | sort -rn

  echo ""
  echo "=== FULL LIST ==="
  jq -r '.exercises[] | "\(.name) [\(.category)]"' $EXERCISES_FILE | sort

} > $OUTPUT_FILE

echo "Report saved to $OUTPUT_FILE"