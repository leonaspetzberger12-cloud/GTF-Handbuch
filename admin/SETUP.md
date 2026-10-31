# Bearbeitbare Auszahlungstabelle aktivieren

Die Tabelle ist direkt in das Handbuch eingebaut. Über den Excel-Import lassen sich die neun Wochen und 158 Personeneinträge der bereitgestellten Datei übernehmen. Namen, Anzahlen, Multiplikationsfaktoren, Rückerstattungen, Auszahlungsstatus und Zusatzwerte aus Spalte M bleiben erhalten. Die Beträge werden aus Anzahl × Faktor und Rückerstattung berechnet; reine Zwischensummenzeilen werden durch berechnete Summen ersetzt.

## Einmalige Einrichtung im vorhandenen Cloudflare-Pages-Projekt

1. D1-Datenbank erstellen und `admin/schema.sql` in deren SQL-Konsole ausführen (auch bei bereits vorhandener Einrichtung nochmals ausführen). Im Pages-Projekt als **ADMIN_DB** anbinden.
2. **ADMIN_PIN** als verschlüsseltes Secret setzen: zufälliger PIN mit 10–32 Ziffern, kein voreingestellter PIN. Nicht in GitHub speichern.
3. Nach der ersten Anmeldung **Excel / JSON importieren** wählen, die bereitgestellte Auszahlungstabelle auswählen und **Änderungen speichern** drücken. Die Daten werden direkt in der privaten D1-Datenbank gespeichert, nicht in GitHub.
4. Das bestehende Cloudflare-Pages-Projekt aus diesem Repository/Branch `main` erneut bereitstellen. Projekt- und Ausgabeverzeichnis: Repository-Stamm. Pages Functions aus `functions/` müssen mitdeployt werden. GitHub Pages alleine kann diesen Admin-Bereich nicht ausführen.

R2 ist für die bearbeitbare Tabelle nicht nötig. Der frühere optionale XLSX-Dateiabruf bleibt nur als separate API für eine bestehende ADMIN_FILES-R2-Bindung erhalten und ist keine Synchronisierung mit der bearbeiteten Tabelle. Excel-Original und Google-Drive-Original werden nicht verändert.

## Bedienung

Fünfmal zügig auf den GTF-Namen/das Logo klicken oder Strg+Alt+A drücken. Mit PIN anmelden. Kalenderwoche wählen, Werte direkt bearbeiten, danach **Änderungen speichern**. Alle Admins sehen nach Neuladen den zentral gespeicherten Stand. Neue Personen und Wochen sind möglich. Die neue Woche übernimmt Namen und Faktoren, setzt Anzahlen, Rückerstattung und Auszahlungsstatus zurück. CSV exportiert die angezeigte Woche, JSON-Sicherung alle Wochen einschließlich ungespeicherter Änderungen.

Bei zeitgleichen Änderungen blockiert der Server das Überschreiben eines neueren Stands. Dann eigene Änderungen als JSON sichern, neu laden und abgleichen. Eine JSON-Sicherung kann über denselben Import-Button wieder eingelesen werden. Die Sitzung endet nach 30 Minuten, Abmeldung oder PIN-Wechsel. Bei Ablauf gehen nicht gespeicherte Änderungen verloren. Vor Ablauf speichern.

Es gelten fünf Anmeldeversuche je IP und 50 insgesamt pro festem 15-Minuten-Fenster. Der globale Grenzwert kann bei Angriffen auch gültige Anmeldungen zeitweilig blockieren. Produktionsdatenbank und Secrets nicht an öffentliche Vorschau-Deployments binden.

## Prüfung nach Aktivierung

- Ohne Anmeldung: `/api/admin/table` liefert 401 und keine Tabellendaten.
- Mit PIN: alle neun Wochen erscheinen; Originalwerte stichprobenartig vergleichen.
- Einen Wert bearbeiten und speichern, neu laden: Änderung bleibt erhalten.
- Zwei Browser mit demselben Stand öffnen: nach Speichern im ersten Browser muss Speichern im zweiten einen Konflikt anzeigen.
- Abmelden: erneuter Datenabruf liefert 401.

Lokale Tests: `node --test tests/*.test.mjs`. Cloudflare-Dokumentation: https://developers.cloudflare.com/pages/functions/bindings/
