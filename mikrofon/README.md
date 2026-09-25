# Dauer-Mikrofon für Claude Code

Du startest das Mikrofon einmal, und danach geht jeder Satz, den du sagst, an Claude Code.
Alle Sätze landen in **derselben Session**. Wenn du **„Mikrofon stopp“** sagst, geht das Mikrofon aus.

## Voraussetzungen (auf deinem eigenen Computer)

- [Claude Code](https://code.claude.com) ist installiert, und du bist angemeldet (`claude` läuft im Terminal)
- Node.js 18 oder neuer
- Chrome oder Edge (für die Spracherkennung im Browser)

## Starten

```bash
cd /pfad/zu/deinem/projekt      # in diesem Ordner arbeitet Claude
node /pfad/zu/enter/mikrofon/server.js
```

Oder im Ordner dieses Repos:

- `npm run mikrofon`: Claude darf nur lesen und fragt bei allem anderen nicht nach, sondern lehnt ab
- `npm run mikrofon:permission`: Claude darf ohne Rückfrage Dateien ändern (`acceptEdits`)

### Mit Doppelklick starten

- **Mac:** `mikrofon/Mikrofon starten.command` doppelklicken (beim ersten Mal: Rechtsklick → Öffnen)
- **Windows:** `mikrofon/Mikrofon starten.bat` doppelklicken

Beide Dateien starten `npm run mikrofon:permission`. Du kannst dir eine Verknüpfung davon auf den Desktop oder ins Dock/in die Taskleiste legen.

Der Browser öffnet sich unter http://localhost:4711. Erlaube dort den Zugriff aufs Mikrofon, und dann einfach sprechen.

- **„Mikrofon stopp“** → Das Mikrofon geht aus. Im Terminal steht dann, wie du mit `claude --resume <id>` im selben Gespräch weiterschreiben kannst.
- **„Antworten vorlesen“** anhaken → Claude antwortet auch mit Sprache. Während des Vorlesens ist das Mikrofon pausiert.
- Den Server schliesst du mit `Ctrl+C`.

## Einstellungen (Umgebungsvariablen)

| Variable | Bedeutung |
| --- | --- |
| `PORT` | Port des lokalen Servers (Standard `4711`) |
| `MIKROFON_CWD` | Ordner, in dem Claude arbeitet (Standard: aktueller Ordner) |
| `MIKROFON_PERMISSION_MODE` | z.B. `acceptEdits`, damit Claude ohne Rückfrage Dateien ändern darf. Ohne diese Variable werden Aktionen, die eine Erlaubnis brauchen, abgelehnt. |
| `MIKROFON_SESSION` | Eine bestehende Claude-Session-ID, die fortgesetzt werden soll |
| `CLAUDE_BIN` | Pfad zum `claude`-Befehl, falls er nicht im PATH liegt |

Eine andere Sprache stellst du über die URL ein, z.B. `http://localhost:4711/?lang=de-CH` oder `?lang=en-US`.

## Gut zu wissen

- Die Spracherkennung macht der Browser. Chrome schickt das Audio dafür an Google-Server.
- Der Server ist nur lokal erreichbar (`127.0.0.1`).
