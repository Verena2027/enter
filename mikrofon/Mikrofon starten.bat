@echo off
REM Windows: Doppelklick startet das Dauer-Mikrofon (Claude darf Dateien aendern)
cd /d "%~dp0.."
npm run mikrofon:permission
pause
