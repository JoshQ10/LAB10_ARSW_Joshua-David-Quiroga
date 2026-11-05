#!/usr/bin/env bash
# Llama secuencialmente a la funcion FibonacciMemo con varios valores de nth y muestra
# el estado del memo que reporta la funcion en las cabeceras de la respuesta.
# Uso: ./postman/memo-test.sh [url_base] [valores...]
set -u
URL="${1:-https://functionprojectfibonacci-jdq-f3d5ckcuhxgse3ef.northcentralus-01.azurewebsites.net}"
shift || true
VALUES="${*:-1000 5000 9000 10000 15000 20000 1000000}"
printf "%-8s %-6s %-9s %-10s %-11s %-11s %-25s %s\n" "nth" "http" "tiempo" "memoHit" "memoAntes" "memoDesp" "instanciaIniciada" "cuerpo"
for n in $VALUES; do
  H=$(mktemp); B=$(mktemp)
  T=$(curl -s -D "$H" -o "$B" -w "%{http_code} %{time_total}" -X POST -H "Content-Type: application/json" -d "{\"nth\":$n}" "$URL/api/FibonacciMemo")
  h() { grep -i "^$1:" "$H" | head -1 | cut -d' ' -f2- | tr -d '\r'; }
  BODY=$(head -c 60 "$B"); [ "$(wc -c < "$B")" -gt 60 ] && BODY="$(wc -c < "$B" | tr -d ' ') digitos"
  printf "%-8s %-6s %-9s %-10s %-11s %-11s %-25s %s\n" "$n" "${T% *}" "${T#* }s" "$(h x-memo-hit)" "$(h x-memo-size-before)" "$(h x-memo-size-after)" "$(h x-instance-started-at)" "$BODY"
  rm -f "$H" "$B"
done
