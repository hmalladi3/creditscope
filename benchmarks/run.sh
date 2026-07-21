#!/usr/bin/env bash
# Load-tests the running backend (docker compose up, or any BASE_URL) with `hey`.
# @spec — supplemental to the HLD Success Metrics; not itself an EARS-tracked behavior.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
OUT_DIR="$(dirname "$0")"

command -v hey >/dev/null 2>&1 || { echo "hey is required: brew install hey"; exit 1; }

echo "Benchmarking $BASE_URL"

echo "=== GET /api/companies (paginated list) ==="
hey -n 2000 -c 50 "$BASE_URL/api/companies?size=20" | tee "$OUT_DIR/bench-list.txt"

echo "=== GET /api/companies (search+filter+currentGrade sort, native LATERAL join) ==="
hey -n 2000 -c 50 "$BASE_URL/api/companies?sort=currentGrade,desc&sector=Industrials" | tee "$OUT_DIR/bench-filtered-sort.txt"

COMPANY_ID=$(curl -s "$BASE_URL/api/companies?size=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['content'][0]['id'])")

echo "=== GET /api/companies/{id} (detail view) ==="
hey -n 2000 -c 50 "$BASE_URL/api/companies/$COMPANY_ID" | tee "$OUT_DIR/bench-detail.txt"

echo "=== GET /api/ratings/distribution (native DISTINCT ON aggregation) ==="
hey -n 2000 -c 50 "$BASE_URL/api/ratings/distribution" | tee "$OUT_DIR/bench-distribution.txt"

echo "=== POST /api/auth/login (BCrypt password verification) ==="
hey -n 500 -c 20 -m POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "$BASE_URL/api/auth/login" | tee "$OUT_DIR/bench-login.txt"

echo "Done. Results written to $OUT_DIR/bench-*.txt"
