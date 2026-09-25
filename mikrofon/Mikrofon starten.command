#!/bin/sh
# macOS: Doppelklick startet das Dauer-Mikrofon (Claude darf Dateien ändern)
cd "$(dirname "$0")/.." && npm run mikrofon:permission
