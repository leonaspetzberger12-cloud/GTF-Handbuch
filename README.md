# GTF DE 03 – GitHub Pages + Admin-Editor

Dieses Repository veröffentlicht das Handbuch für Besucher. Die **Inhalte** (Texte, Kapitel und Bilder) werden über **Pages CMS** mit einem berechtigten GitHub-Konto geändert.

## Einmalige Einrichtung
1. Den Pull Request mit dieser Änderung auf `main` übernehmen.
2. https://app.pagescms.org öffnen und mit dem GitHub-Konto anmelden, das Schreibrechte auf `leonaspetzberger12-cloud/GTF-Handbuch` hat.
3. Pages CMS den Zugriff auf **dieses Repository** erlauben.
4. Das Repository und den Branch `main` in Pages CMS öffnen.
5. **GTF Handbuch bearbeiten** auswählen, Kapitel/Regeln ändern, Bilder hochladen und **Save** klicken.

## Dateistruktur
- `index.html`: öffentliches Dashboard im Lesemodus. Ruft `content/handbook.json` ab.
- `content/handbook.json`: offizielle veröffentlichte Kapitel und Abschnitte.
- `.pages.yml`: Bearbeitungsformular mit Bild-Upload über Pages CMS.
- `media/`: Bilder, die über Pages CMS hochgeladen werden.

## Bearbeitungsrechte
Kein Admin-Passwort in die HTML-Datei schreiben. **Nur GitHub-Accounts mit Schreibrechten und entsprechender Pages-CMS-Berechtigung** können Änderungen am Repository veröffentlichen. Auf der öffentlich zugänglichen Webseite gibt es keine Bearbeitungsfunktion; jeder Besucher kann trotzdem das Farbschema nur für seinen eigenen Browser ändern.

**Achtung:** GitHub Pages und das öffentliche Repository enthalten öffentlich zugängliche Texte und Bilder. Keine vertraulichen Daten hochladen.

## Updates und Sicherheit
Ein Commit aus Pages CMS aktualisiert die JSON-Daten. GitHub Pages veröffentlicht die Änderungen nach dem Build. Gäste laden beim Neubesuch die aktualisierten Daten. Im Browser gespeicherte alte Kapitel werden nicht mehr berücksichtigt; persönliche Favoriten, Notizen und Farben bleiben lokal erhalten.

Kapitel-IDs müssen einzigartig sein und dürfen nur Kleinbuchstaben, Ziffern, `_` und `-` verwenden. Bestehende IDs möglichst nicht ändern. Die initialen Beispielregeln bitte durch eure freigegebenen Vorschriften ersetzen.

Bei direktem Öffnen mit `file://` funktioniert das Laden der JSON-Daten eventuell nicht. Die Webseite über GitHub Pages oder einen lokalen Webserver testen.
