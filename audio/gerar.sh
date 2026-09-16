#!/bin/bash
# Gera os MP3 das aulas a partir dos roteiros.
#   ./gerar.sh            -> voz padrão (Luciana), 172 palavras/min
#   ./gerar.sh Reed 165   -> outra voz / outro ritmo
# Depois de gerar, rode ./gerar.sh --manifesto para ver as durações.
set +u
export LC_NUMERIC=C
cd "$(dirname "$0")"
VOZ="${1:-Luciana}"
WPM="${2:-172}"

if [ "$1" = "--manifesto" ]; then
  for f in *.mp3; do
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
    printf '%s %.0f\n' "${f%.mp3}" "$d"
  done
  exit 0
fi

for r in roteiros/*.txt; do
  id=$(basename "$r" .txt)
  say -v "$VOZ" -r "$WPM" -f "$r" -o "/tmp/_$id.aiff"
  ffmpeg -loglevel error -y -i "/tmp/_$id.aiff" \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
    -codec:a libmp3lame -b:a 64k -ac 1 -ar 24000 \
    -metadata title="$id" -metadata artist="IA Aplicada aos Negócios" \
    "$id.mp3"
  rm -f "/tmp/_$id.aiff"
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$id.mp3")
  printf '%-7s %5.0fs  %4dKB  voz=%s\n' "$id" "$d" "$(( $(stat -f%z "$id.mp3") / 1024 ))" "$VOZ"
done
