/* GTF DE 03 · Zivilstreifen-Anmeldung: Nur Textvorlage, keine Übermittlung. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const clean = (value, max = 180) => String(value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  let employees = [];
  let selected = [];

  window.zivilPage = function () {
    return `
<div class="breadcrumb">GTF <span class="zivil-crumb-arrow">›</span> <strong>Zivilstreifen-Anmeldung</strong></div>
<section class="panel zivil-hero">
  <div class="zivil-hero-icon" aria-hidden="true">🚓</div>
  <div>
    <p class="eyebrow">GTF DE 03 · FORMULAR-CENTER</p>
    <h1 class="chapter-name">Zivilstreifen-Anmeldung</h1>
    <p class="chapter-desc">Fülle deine Streifendaten aus, wähle Mitarbeiter aus und kopiere die fertige Anmeldung für Discord oder ein externes Formular.</p>
  </div>
</section>
<div class="zivil-columns">
  <section class="panel zivil-section">
    <div class="panel-header"><h2 class="panel-title"><span aria-hidden="true">✍️</span> Angaben zur Zivilstreife</h2><span class="tag muted-tag">Zum Ausfüllen</span></div>
    <div class="zivil-body">
      <div class="zivil-field">
        <label for="zivilRoster">Mitarbeiter auswählen</label>
        <div class="zivil-inline">
          <select id="zivilRoster" class="zivil-control" aria-label="Mitarbeiter aus der Liste auswählen">
            <option value="">Mitarbeiter auswählen …</option>
          </select>
          <button class="zivil-button zivil-button-secondary" id="zivilAddRoster" type="button">Hinzufügen</button>
        </div>
        <p class="zivil-help" id="zivilRosterHelp">Mitarbeiterliste wird geladen …</p>
      </div>
      <div class="zivil-field">
        <label for="zivilName">Weitere Mitarbeiter eintragen</label>
        <div class="zivil-inline">
          <input id="zivilName" class="zivil-control" maxlength="90" autocomplete="off" placeholder="z. B. Max Mustermann" aria-label="Mitarbeitername eingeben">
          <button class="zivil-button zivil-button-secondary" id="zivilAddName" type="button">+ Hinzufügen</button>
        </div>
        <div id="zivilNames" class="zivil-names" aria-live="polite"></div>
      </div>
      <div class="zivil-field-grid">
        <div class="zivil-field">
          <label for="zivilDuration">Dauer</label>
          <input id="zivilDuration" class="zivil-control" placeholder="z. B. 2 Stunden" maxlength="90">
        </div>
        <div class="zivil-field">
          <label for="zivilPlate">Kennzeichen</label>
          <input id="zivilPlate" class="zivil-control" placeholder="XXX" maxlength="35" autocapitalize="characters">
        </div>
      </div>
      <div class="zivil-field">
        <label for="zivilIdChange">ID Change</label>
        <input id="zivilIdChange" class="zivil-control" placeholder="z. B. 12345 → 67890 oder Nein" maxlength="100">
      </div>
      <div class="zivil-field-grid">
        <div class="zivil-field">
          <label for="zivilStart">Beginn</label>
          <input id="zivilStart" class="zivil-control" type="datetime-local">
        </div>
        <div class="zivil-field">
          <label for="zivilEnd">Beendet</label>
          <input id="zivilEnd" class="zivil-control" type="datetime-local">
        </div>
      </div>
      <div class="zivil-bottom-bar">
        <span class="zivil-help">Die Eingaben werden nicht automatisch abgesendet.</span>
        <button id="zivilReset" class="zivil-button zivil-button-ghost" type="button">Zurücksetzen</button>
      </div>
    </div>
  </section>
  <section class="panel zivil-section zivil-preview-side">
    <div class="panel-header"><h2 class="panel-title"><span aria-hidden="true">📋</span> Kopiervorlage</h2><span class="tag">LIVE</span></div>
    <div class="zivil-body">
      <p class="zivil-help zivil-preview-desc">Dein Text wird beim Ausfüllen automatisch aktualisiert und kann überall eingefügt werden.</p>
      <div class="zivil-paper">
        <div class="zivil-paper-top"><span class="zivil-paper-led"></span> VORSCHAU · GTF DE 03</div>
        <pre id="zivilPreview" class="zivil-preview-text" aria-live="polite"></pre>
      </div>
      <button id="zivilCopy" class="zivil-button zivil-button-primary" type="button">📋 Anmeldung kopieren</button>
      <div id="zivilCopyStatus" class="zivil-copy-status" role="status" aria-live="polite"></div>
      <p class="zivil-help">Kopiere den Text und füge ihn z. B. in Discord oder in eurem Meldeformular ein. Es wird hier nichts veröffentlicht.</p>
    </div>
  </section>
</div>
`;
  };

  function formatDate(value) {
    if (!value) return 'Noch offen';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return clean(value);
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(date) + ' Uhr';
  }

  function participants() {
    const result = selected.slice();
    const pendingName = clean($('zivilName')?.value, 90);
    const pendingChoice = clean($('zivilRoster')?.value, 90);
    for (const name of [pendingChoice, pendingName]) {
      if (name && !result.some(x => x.toLocaleLowerCase('de') === name.toLocaleLowerCase('de'))) result.push(name);
    }
    return result;
  }

  function formattedText() {
    const get = (id, placeholder) => clean($(id)?.value) || placeholder;
    return [
      '🚓 GTF DE 03 | ZIVILSTREIFEN-ANMELDUNG',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '👥 Mitarbeiter: ' + (participants().join(', ') || 'Noch eintragen'),
      '⏱️ Dauer: ' + get('zivilDuration', 'Noch eintragen'),
      '🚘 Kennzeichen: ' + get('zivilPlate', 'XXX'),
      '🪪 ID Change: ' + get('zivilIdChange', 'Noch eintragen'),
      '🟢 Beginn: ' + (get('zivilStart', '') ? formatDate($('zivilStart').value) : 'Noch eintragen'),
      '🔴 Beendet: ' + formatDate($('zivilEnd')?.value),
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ].join('\n');
  }

  function updatePreview() {
    const pre = $('zivilPreview');
    if (pre) pre.textContent = formattedText();
  }

  function paintSelected() {
    const root = $('zivilNames');
    if (!root) return;
    root.replaceChildren();
    if (!selected.length) {
      const hint = document.createElement('span');
      hint.className = 'zivil-help';
      hint.textContent = 'Noch keine Mitarbeiter hinzugefügt.';
      root.append(hint);
    } else {
      selected.forEach((name, index) => {
        const tag = document.createElement('span');
        tag.className = 'zivil-person';
        const label = document.createElement('span');
        label.textContent = name;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'zivil-person-remove';
        remove.dataset.zivilRemove = String(index);
        remove.setAttribute('aria-label', name + ' entfernen');
        remove.textContent = '×';
        tag.append(label, remove);
        root.append(tag);
      });
    }
    updatePreview();
  }

  function addEmployee(value) {
    const name = clean(value, 90);
    if (!name) return;
    if (selected.some(x => x.toLocaleLowerCase('de') === name.toLocaleLowerCase('de'))) {
      const status = $('zivilCopyStatus');
      if (status) status.textContent = 'Dieser Mitarbeiter ist bereits ausgewählt.';
      return;
    }
    if (selected.length >= 20) {
      const status = $('zivilCopyStatus');
      if (status) status.textContent = 'Maximal 20 Mitarbeiter pro Anmeldung.';
      return;
    }
    selected.push(name);
    if ($('zivilName')) $('zivilName').value = '';
    if ($('zivilRoster')) $('zivilRoster').value = '';
    if ($('zivilCopyStatus')) $('zivilCopyStatus').textContent = '';
    paintSelected();
  }

  async function readRoster() {
    try {
      const res = await fetch('content/employees.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Mitarbeiterliste nicht erreichbar');
      const data = await res.json();
      const raw = Array.isArray(data.employees) ? data.employees : [];
      const names = raw.map(x => clean(typeof x === 'string' ? x : x?.name, 90)).filter(Boolean);
      employees = [...new Set(names)].slice(0, 300);
    } catch (err) {
      console.warn('Zivilstreife: Mitarbeiterliste nicht geladen', err);
      employees = [];
    }
    const list = $('zivilRoster');
    if (!list) return;
    list.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = employees.length ? 'Mitarbeiter auswählen …' : 'Keine Mitarbeiter hinterlegt';
    list.append(placeholder);
    for (const name of employees) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      list.append(option);
    }
    list.disabled = !employees.length;
    if ($('zivilRosterHelp')) {
      $('zivilRosterHelp').textContent = employees.length
        ? employees.length + ' Mitarbeiter hinterlegt. Weitere Namen kannst du unten frei eingeben.'
        : 'Du kannst Mitarbeiter jederzeit frei eintippen. Die Auswahlliste pflegt der Admin über Pages CMS → Mitarbeiterliste.';
    }
  }

  async function copyText() {
    const text = formattedText();
    const status = $('zivilCopyStatus');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API nicht verfügbar');
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = '✓ Anmeldung kopiert! Jetzt an der gewünschten Stelle einfügen.';
    } catch (err) {
      try {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.append(temp);
        temp.select();
        const copied = document.execCommand('copy');
        temp.remove();
        if (!copied) throw new Error('Kopieren nicht erlaubt');
        if (status) status.textContent = '✓ Anmeldung kopiert!';
      } catch (_) {
        if (status) status.textContent = 'Automatisches Kopieren nicht möglich. Bitte den Vorschautext markieren und kopieren.';
      }
    }
  }

  window.zivilInit = function () {
    const form = $('zivilDuration');
    if (!form) return;
    selected = [];
    paintSelected();
    readRoster();

    const addName = $('zivilAddName');
    const addRoster = $('zivilAddRoster');
    if (addName) addName.addEventListener('click', () => addEmployee($('zivilName').value));
    if (addRoster) addRoster.addEventListener('click', () => addEmployee($('zivilRoster').value));
    if ($('zivilName')) $('zivilName').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); addEmployee(e.currentTarget.value); }
    });
    const inputs = ['zivilName','zivilRoster','zivilDuration','zivilPlate','zivilIdChange','zivilStart','zivilEnd'];
    for (const id of inputs) {
      $(id)?.addEventListener('input', updatePreview);
      $(id)?.addEventListener('change', updatePreview);
    }
    $('zivilNames')?.addEventListener('click', e => {
      const remove = e.target.closest('[data-zivil-remove]');
      if (!remove) return;
      const index = Number(remove.dataset.zivilRemove);
      if (Number.isInteger(index) && index >= 0 && index < selected.length) selected.splice(index, 1);
      paintSelected();
    });
    $('zivilCopy')?.addEventListener('click', copyText);
    $('zivilReset')?.addEventListener('click', () => {
      if (!window.confirm('Alle Angaben dieser Anmeldung zurücksetzen?')) return;
      selected = [];
      inputs.forEach(id => { const node = $(id); if (node) node.value = ''; });
      $('zivilCopyStatus').textContent = '';
      paintSelected();
    });
  };
})();
