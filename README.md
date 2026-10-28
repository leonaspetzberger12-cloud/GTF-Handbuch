# GTF DE 03 – Veröffentlichung und Bearbeitung

## Veröffentlichen
1. Den GitHub-Änderungsvorschlag dieses Branches einmal nach `main` zusammenführen.
2. Kontrollieren, dass GitHub Pages aus `main` / (root) veröffentlicht.
3. Danach ist das Handbuch unter https://leonaspetzberger12-cloud.github.io/GTF-Handbuch/ erreichbar.

## Texte und Bilder über Pages CMS bearbeiten
1. Unter https://app.pagescms.org mit dem berechtigten GitHub-Konto anmelden.
2. Repository `leonaspetzberger12-cloud/GTF-Handbuch` wählen.
3. **Unbedingt Branch `main`** wählen, damit neue Änderungen direkt veröffentlicht werden.
4. `GTF Handbuch bearbeiten` öffnen, Text und Bilder bearbeiten, **Save** drücken.
5. GitHub Pages aktualisiert die Webseite nach dem Deployment; notfalls neu laden.

## Dateien
- `index.html`: Webseitenlayout (HTML, CSS und JavaScript)
- `content/handbook.json`: alle sichtbaren Texte und Bildverweise, direkt durch Pages CMS bearbeitbar
- `.pages.yml`: Konfiguration des Editors
- `media/`: hochgeladene Bilder

Besucher haben keinen Editorzugriff. Schreibzugriff haben nur entsprechend berechtigte GitHub-/Pages-CMS-Konten. **Das öffentliche GitHub-Repository samt Handbuchtexten und Bildern ist für jeden einsehbar.** Deshalb keine vertraulichen Inhalte veröffentlichen.

Wichtiger Hinweis: `index.html` darf **nie** mit JSON aus Pages CMS ersetzt werden. Die JSON-Texte gehören nur nach `content/handbook.json`. Sollte die Webseite später auf eine eigene Domain umziehen, muss der Medienpfad in `.pages.yml` und in Bildverweisen angepasst werden.
