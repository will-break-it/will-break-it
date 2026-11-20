// Brief form: posts to /api/enquiry, mirrors itself as the JSON an
// agent would send, and falls back to email when the endpoint cannot send.
(function () {
    const form = document.getElementById('brief-form');
    if (!form) return;
    const root = document.documentElement;
    const lang = () => (root.getAttribute('data-lang') === 'de' ? 'de' : 'en');
    const pre = document.getElementById('brief-json');
    const status = document.getElementById('brief-status');
    const send = document.getElementById('brief-send');
    const copy = document.getElementById('brief-copy');
    const MAIL = 'contact@williwolff.com';
    const T = {
        en: {
            email: 'Give an email address I can reply to.',
            summary: 'Describe what you need in a sentence or more.',
            sent: 'Brief received. I read every request myself and reply by email.',
            ref: 'Reference',
            failed: 'The form could not send this. Your text is still here.',
            mail: 'Send it by email instead',
            copied: 'Copied',
            copy: 'Copy',
            updated: 'Last updated',
        },
        de: {
            email: 'Bitte eine E-Mail-Adresse angeben, auf die ich antworten kann.',
            summary: 'Bitte in mindestens einem Satz beschreiben, worum es geht.',
            sent: 'Anfrage erhalten. Ich lese jede Anfrage selbst und antworte per E-Mail.',
            ref: 'Referenz',
            failed: 'Das Formular konnte die Anfrage nicht senden. Ihr Text steht noch hier.',
            mail: 'Stattdessen per E-Mail senden',
            copied: 'Kopiert',
            copy: 'Kopieren',
            updated: 'Stand',
        },
    };
    const EXAMPLE = {
        email: 'ada@example.com',
        summary: 'Extract figures from supplier PDFs into our ERP, with review.',
    };

    function values() {
        const data = new FormData(form);
        const get = k => String(data.get(k) || '').trim();
        return {
            email: get('email'),
            summary: get('summary'),
            name: get('name'),
            project_type: get('project_type'),
            timeline: get('timeline'),
            budget_eur: get('budget_eur'),
        };
    }

    // The request an agent would send for what the form holds right now.
    function preview() {
        const v = values();
        const body = { email: v.email || EXAMPLE.email, summary: v.summary || EXAMPLE.summary };
        if (v.name) body.name = v.name;
        body.project_type = v.project_type;
        body.timeline = v.timeline;
        body.budget_eur = v.budget_eur;
        body.submitted_by = 'agent';
        pre.textContent = 'POST https://williwolff.com/api/enquiry\nContent-Type: application/json\n\n' + JSON.stringify(body, null, 2);
    }

    // Option labels and placeholders cannot carry both languages in markup.
    function localise() {
        const l = lang();
        form.querySelectorAll('option[data-en]').forEach(o => { o.textContent = o.getAttribute('data-' + l); });
        form.querySelectorAll('[data-placeholder-en]').forEach(el => { el.placeholder = el.getAttribute('data-placeholder-' + l); });
        copy.textContent = T[l].copy;
        showUpdated();
    }

    function fieldError(name, message) {
        const input = form.elements[name];
        const note = document.getElementById('brief-' + name + '-error');
        if (!input || !note) return;
        note.textContent = message || '';
        note.hidden = !message;
        if (message) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
    }

    function say(lines, link, isError) {
        status.textContent = '';
        lines.forEach((line, i) => {
            if (i) status.appendChild(document.createElement('br'));
            status.appendChild(document.createTextNode(line));
        });
        if (link) {
            status.appendChild(document.createTextNode(' '));
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            status.appendChild(a);
        }
        status.classList.toggle('is-error', !!isError);
        status.hidden = false;
    }

    function mailto(v) {
        const body = [v.summary, '', 'Kind of project: ' + v.project_type, 'Timeline: ' + v.timeline, 'Budget (EUR): ' + v.budget_eur, v.name ? 'Name: ' + v.name : '']
            .filter((line, i) => i < 2 || line).join('\n');
        return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Project brief') + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const t = T[lang()];
        const v = values();
        const problems = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? '' : t.email,
            summary: v.summary.length >= 10 ? '' : t.summary,
        };
        fieldError('email', problems.email);
        fieldError('summary', problems.summary);
        status.hidden = true;
        if (problems.summary) { form.elements.summary.focus(); return; }
        if (problems.email) { form.elements.email.focus(); return; }

        send.disabled = true;
        try {
            const response = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.assign({}, v, {
                    locale: lang(),
                    submitted_by: 'human',
                    hp_confirm: form.elements.hp_confirm.value,
                })),
            });
            const body = await response.json().catch(() => null);
            if (response.ok && body && body.ok) {
                say([body.message || t.sent, body.reference ? t.ref + ': ' + body.reference : ''].filter(Boolean));
                form.reset();
                localise();
                preview();
            } else if (response.status === 400 && body && body.fields) {
                fieldError('email', body.fields.email);
                fieldError('summary', body.fields.summary);
                say([body.error], null, true);
            } else {
                throw new Error('not sent');
            }
        } catch (err) {
            say([t.failed], { href: mailto(v), text: t.mail + ' (' + MAIL + ')' }, true);
        } finally {
            send.disabled = false;
        }
    });

    form.addEventListener('input', preview);
    form.addEventListener('change', preview);

    copy.addEventListener('click', function () {
        const t = T[lang()];
        const done = () => { copy.textContent = t.copied; setTimeout(() => { copy.textContent = T[lang()].copy; }, 1600); };
        const select = () => {
            const range = document.createRange();
            range.selectNodeContents(pre);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pre.textContent).then(done, select);
        else select();
    });

    // The CV's own date, read from the data file the CV section links to.
    let cvDate = null;
    function showUpdated() {
        const el = document.querySelector('[data-cv-updated]');
        if (!el || !cvDate) return;
        const l = lang();
        const text = new Date(cvDate + 'T00:00:00Z').toLocaleDateString(l === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        el.textContent = T[l].updated + (l === 'de' ? ': ' : ' ') + text + '.';
        el.hidden = false;
    }
    fetch('/cv.json').then(r => (r.ok ? r.json() : null)).then(cv => {
        const date = cv && cv.meta && cv.meta.lastModified;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { cvDate = date; showUpdated(); }
    }).catch(() => {});

    // Service pages and case studies link here with ?type=<kind of project>.
    const wanted = new URLSearchParams(location.search).get('type');
    const kind = form.elements.project_type;
    if (wanted && kind && Array.from(kind.options).some(o => o.value === wanted)) kind.value = wanted;

    localise();
    preview();
})();
