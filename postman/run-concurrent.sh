#!/usr/bin/env bash
# Lanza N ejecuciones de Newman en paralelo (por defecto 10) contra la coleccion indicada
# y guarda un reporte JSON por cada ejecucion en postman/results/.
# Uso: ./postman/run-concurrent.sh [concurrencia] [nth] [coleccion]
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
CONCURRENCY="${1:-10}"
NTH="${2:-1000000}"
COLLECTION="${3:-$DIR/ARSW_LAB10_Fibonacci.postman_collection.json}"
OUT="$DIR/results"
mkdir -p "$OUT"
rm -f "$OUT"/run-*.json "$OUT"/run-*.log
START=$(date +%s)
for i in $(seq 1 "$CONCURRENCY"); do
  npx --yes newman@6.2.1 run "$COLLECTION" \
    -e "$DIR/ARSW_LAB10.postman_environment.json" \
    --env-var "NTH=$NTH" \
    --timeout-request 300000 \
    -r cli,json --reporter-json-export "$OUT/run-$i.json" > "$OUT/run-$i.log" 2>&1 &
done
wait
END=$(date +%s)
{
  echo "Concurrencia=$CONCURRENCY nth=$NTH tiempo total=$((END-START))s"
  node "$DIR/summarize.js" "$OUT"
} | tee "$OUT/resumen.txt"
# Los reportes JSON incluyen el cuerpo completo de cada respuesta (varios MB); solo se conservan los logs y el resumen.
rm -f "$OUT"/run-*.json
