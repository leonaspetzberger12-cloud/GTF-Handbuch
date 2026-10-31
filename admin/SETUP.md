# Geschützter Admin-Bereich auf Cloudflare Pages

Der Code ist vorbereitet. Vor der Nutzung sind die folgenden Einstellungen im bestehenden Cloudflare-Pages-Projekt `gtf-de03` notwendig. GitHub Pages alleine führt diese serverseitige Anmeldung nicht aus. Die öffentliche Handbuchseite bleibt auch ohne Einrichtung nutzbar; der Admin-Dienst verweigert dann jeden Zugriff.

## Aktivieren

1. Den Änderungsvorschlag nach `main` zusammenführen. Das bestehende Pages-Projekt muss dieses Repository verwenden; Projektstamm und Ausgabeverzeichnis sind der Repository-Stamm. Cloudflare muss den Ordner `functions/` als Pages Functions bereitstellen (Git-Integration oder Wrangler, kein reiner Dashboard-Dateiupload).
2. In Cloudflare eine D1-Datenbank für Admin-Sitzungen erstellen. In deren SQL-Konsole den Inhalt von `admin/schema.sql` ausführen. Im Pages-Projekt unter Bindings die Datenbank als **ADMIN_DB** anbinden.
3. Einen **privaten** R2-Bucket erstellen und als **ADMIN_FILES** anbinden. Öffentliche r2.dev-URLs und öffentliche Domains für diesen Bucket deaktiviert lassen.
4. Unter den Variablen/Secrets des Pages-Projekts **ADMIN_PIN** als verschlüsseltes Secret setzen: ein zufälliger PIN mit 10 bis 32 Ziffern. Den echten PIN niemals in GitHub, HTML oder JavaScript eintragen. Es gibt keinen voreingestellten PIN.
5. Die vorhandene Datei **GTF-GANGTASKFORCE AUSZAHLUNG.xlsx** in diesen privaten R2-Bucket hochladen und den Objektschlüssel genau **GTF-GANGTASKFORCE-AUSZAHLUNG.xlsx** nennen. Alternativ nach der ersten Admin-Anmeldung über „Datei speichern“ hochladen. Die Originaldatei wird bytegetreu gespeichert und als Excel-Datei heruntergeladen; es gibt keine automatische Google-Drive-Synchronisierung und keinen Tabelleneditor.
6. Nach Einrichtung der Bindings und des Secrets erneut deployen. Produktionsressourcen nur an Produktion binden; für Vorschau-Deployments eigene Ressourcen/PIN verwenden oder den Admin-Bereich dort deaktiviert lassen.

## Bedienung

Fünfmal zügig auf den GTF-Markennamen bzw. das Logo oben links klicken, auch auf Mobilgeräten. Alternativ **Strg + Alt + A** drücken. Der Zugang steht nicht in der Navigation. Der Einstieg ist nur unauffällig, kein Sicherheitsmechanismus: jede Datei-Anfrage wird zusätzlich auf dem Server geprüft.

PIN eingeben → „Excel-Datei abrufen“. Admins können über die Dateiauswahl die Tabelle für alle Admins ersetzen (maximal 10 MB). Die Anmeldung berechtigt ausschließlich zum privaten Dateiabruf/-austausch, nicht zum Ändern der Handbuchtexte oder zu GitHub-/Cloudflare-Verwaltung.

Die Sitzung endet nach 30 Minuten oder mit „Abmelden“. Eine PIN-Änderung macht bestehende Sitzungen ungültig. Maximal fünf Anmeldeversuche je IP und 50 insgesamt innerhalb eines festen 15-Minuten-Zeitfensters sind erlaubt. Der globale Grenzwert schützt gegen verteiltes PIN-Raten, kann aber unter Angriff auch berechtigte Anmeldungen zeitweilig blockieren.

## Prüfung nach Deployment

- Ohne Anmeldung `/api/admin/file` öffnen: 401, keine Datei.
- Falschen PIN eingeben: keine Anmeldung. Sechster Versuch im Zeitfenster: 429.
- Mit richtigem PIN anmelden, Datei abrufen und mit dem Original vergleichen.
- Abmelden und den Dateiabruf erneut versuchen: 401.
- Testen, dass der R2-Bucket weder eine öffentliche URL noch eine öffentliche Domain anbietet.
- Bei „Admin-Zugang ist noch nicht eingerichtet“ Bindings und Secret prüfen; bei 503 nach Einrichtung D1-Schema und Cloudflare-Logs prüfen. Secrets und PIN niemals protokollieren.

Lokale Logiktests: `node --test tests/admin.test.mjs`. Diese prüfen mit simulierten Bindings Zugriffsschutz, Versuchslimit, Ablauf, PIN-Wechsel, Upload und Abmeldung. Eine echte Cloudflare-Deployment-Prüfung bleibt zusätzlich erforderlich.

Cloudflare-Dokumentation: https://developers.cloudflare.com/pages/functions/bindings/
