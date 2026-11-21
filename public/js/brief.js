// Brief form: posts to /api/enquiry, mirrors itself as the JSON an
// agent would send, and falls back to email when the endpoint cannot send.
//
// It also gives the form its motion, after transitions.dev: dropdowns that
// grow from their button, a field that shakes when it is wrong, a send button
// whose label changes as the brief goes out. The rules are the t-* classes at
// the end of site.css; this script only switches their states.
(function () {
    const form = document.getElementById('brief-form');
    if (!form) return;
    const root = document.documentElement;
    const lang = () => (root.getAttribute('data-lang') === 'de' ? 'de' : 'en');
    const pre = document.getElementById('brief-json');
    const status = document.getElementById('brief-status');
    const send = document.getElementById('brief-send');
    const sendLabel = document.getElementById('brief-send-label');
    const sendCheck = document.getElementById('brief-send-check');
    const copy = document.getElementById('brief-copy');
    const copyLabel = document.getElementById('brief-copy-label');
    const MAIL = 'contact@williwolff.com';
    const T = {
        en: {
            email: 'Give an email address I can reply to.',
            summary: 'Describe what you need in a sentence or more.',
            sent: 'Brief received. I read every request myself and reply by email.',
            ref: 'Reference',
            failed: 'The form could not send this. Your text is still here.',
            limited: 'Too many briefs for now. Your text is still here.',
            mail: 'Send it by email instead',
            copied: 'Copied',
            copy: 'Copy',
            updated: 'Last updated',
            sending: 'Sending…',
            done: 'Sent',
        },
        de: {
            email: 'Bitte eine E-Mail-Adresse angeben, auf die ich antworten kann.',
            summary: 'Bitte in mindestens einem Satz beschreiben, worum es geht.',
            sent: 'Anfrage erhalten. Ich lese jede Anfrage selbst und antworte per E-Mail.',
            ref: 'Referenz',
            failed: 'Das Formular konnte die Anfrage nicht senden. Ihr Text steht noch hier.',
            limited: 'Im Moment sind es zu viele Anfragen. Ihr Text steht noch hier.',
            mail: 'Stattdessen per E-Mail senden',
            copied: 'Kopiert',
            copy: 'Kopieren',
            updated: 'Stand',
            sending: 'Wird gesendet…',
            done: 'Gesendet',
        },
    };
    const EXAMPLE = {
        email: 'ada@example.com',
        summary: 'Extract figures from supplier PDFs into our ERP, with review.',
    };

    // Timings come from the variables in site.css, so the two cannot drift apart.
    const tokens = getComputedStyle(root);
    const ms = (name, fallback) => {
        const value = parseFloat(tokens.getPropertyValue(name));
        return Number.isFinite(value) ? value : fallback;
    };
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Text states swap: the old text leaves upwards, the new one arrives from below.
    function swapText(el, next) {
        clearTimeout(el._swap);
        if (calm.matches) { el.classList.remove('is-exit'); el.textContent = next; return; }
        el.classList.add('is-exit');
        el._swap = setTimeout(() => {
            el.textContent = next;
            el.classList.remove('is-exit');
            el.classList.add('is-enter-start');
            void el.offsetHeight; // so the next change is animated
            el.classList.remove('is-enter-start');
        }, ms('--text-swap-dur', 150));
    }

    // Error state shake, started again from rest each time.
    function shake(input) {
        input.classList.remove('is-shaking');
        void input.offsetWidth;
        input.classList.add('is-shaking');
        clearTimeout(input._shake);
        input._shake = setTimeout(() => input.classList.remove('is-shaking'), ms('--shake-dur-a', 80) * 2 + ms('--shake-dur-b', 60) * 2 + 20);
    }

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
        if (v.budget_eur) body.budget_eur = v.budget_eur;
        body.submitted_by = 'agent';
        pre.textContent = 'POST https://williwolff.com/api/enquiry\nContent-Type: application/json\n\n' + JSON.stringify(body, null, 2);
    }

    // Option labels and placeholders cannot carry both languages in markup.
    function localise() {
        const l = lang();
        form.querySelectorAll('option[data-en]').forEach(o => { o.textContent = o.getAttribute('data-' + l); });
        form.querySelectorAll('[data-placeholder-en]').forEach(el => { el.placeholder = el.getAttribute('data-placeholder-' + l); });
        copyLabel.textContent = T[l].copy;
        showUpdated();
    }

    function fieldError(name, message) {
        const input = form.elements[name];
        const note = document.getElementById('brief-' + name + '-error');
        if (!input || !note) return;
        const wrap = input.closest('.t-input-wrap');
        clearTimeout(note._hide);
        if (message) {
            note.textContent = message;
            note.hidden = false;
            void note.offsetWidth; // the message fades in from hidden
            wrap.classList.add('is-error');
            input.classList.add('is-error');
            input.setAttribute('aria-invalid', 'true');
            shake(input);
        } else {
            wrap.classList.remove('is-error');
            input.classList.remove('is-error');
            input.removeAttribute('aria-invalid');
            // The message stays in the page until it has faded.
            if (!note.hidden) note._hide = setTimeout(() => { note.hidden = true; note.textContent = ''; }, ms('--revert-dur', 280));
        }
    }
    // The error stays until it is put right: typing in the field takes it away.
    ['email', 'summary'].forEach(name => {
        form.elements[name].addEventListener('input', () => { if (form.elements[name].hasAttribute('aria-invalid')) fieldError(name, ''); });
    });

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
        // Panel reveal: from closed to open, so it arrives each time it is shown.
        status.setAttribute('data-open', 'false');
        void status.offsetWidth;
        status.setAttribute('data-open', 'true');
    }
    function unsay() {
        status.hidden = true;
        status.setAttribute('data-open', 'false');
    }

    // The send button: its label while the brief is on its way, and the tick once it has arrived.
    const sendText = sendLabel.textContent;
    let sendTimer = null;
    function sendState(state) {
        const t = T[lang()];
        clearTimeout(sendTimer);
        send.dataset.state = state;
        if (state === 'idle') {
            send.disabled = false;
            sendCheck.hidden = true;
            sendCheck.setAttribute('data-state', 'out');
            swapText(sendLabel, sendText);
            send.style.minWidth = '';
            return;
        }
        // The button keeps the width of its longest label.
        if (!send.style.minWidth) send.style.minWidth = send.offsetWidth + 'px';
        if (state === 'sending') {
            send.disabled = true;
            swapText(sendLabel, t.sending);
        } else {
            send.disabled = false;
            swapText(sendLabel, t.done);
            sendCheck.hidden = false;
            sendCheck.setAttribute('data-state', 'out');
            void sendCheck.offsetWidth; // so the tick is drawn from its start
            sendCheck.setAttribute('data-state', 'in');
            sendTimer = setTimeout(() => sendState('idle'), 2600);
        }
    }

    function mailto(v) {
        const body = [v.summary, '', 'Kind of project: ' + v.project_type, 'Timeline: ' + v.timeline, v.budget_eur ? 'Budget (EUR): ' + v.budget_eur : '', v.name ? 'Name: ' + v.name : '']
            .filter((line, i) => i < 2 || line).join('\n');
        return 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Project brief') + '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (send.dataset.state === 'sending') return;
        if (send.dataset.state === 'done') sendState('idle');
        const t = T[lang()];
        const v = values();
        const problems = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? '' : t.email,
            summary: v.summary.length >= 10 ? '' : t.summary,
        };
        fieldError('email', problems.email);
        fieldError('summary', problems.summary);
        unsay();
        if (problems.summary) { form.elements.summary.focus(); return; }
        if (problems.email) { form.elements.email.focus(); return; }

        sendState('sending');
        let sent = false;
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
                say([t.sent, body.reference ? t.ref + ': ' + body.reference : ''].filter(Boolean));
                sent = true;
                form.reset();
                localise();
                preview();
            } else if (response.status === 400 && body && body.fields) {
                fieldError('email', body.fields.email);
                fieldError('summary', body.fields.summary);
                say([body.error], null, true);
            } else if (response.status === 429) {
                // The server's own words are for agents; the form speaks in the first person.
                say([t.limited], { href: mailto(v), text: t.mail + ' (' + MAIL + ')' }, true);
            } else {
                throw new Error('not sent');
            }
        } catch (err) {
            say([t.failed], { href: mailto(v), text: t.mail + ' (' + MAIL + ')' }, true);
        } finally {
            sendState(sent ? 'done' : 'idle');
        }
    });

    form.addEventListener('input', preview);
    form.addEventListener('change', preview);

    copy.addEventListener('click', function () {
        const t = T[lang()];
        const done = () => {
            swapText(copyLabel, t.copied);
            clearTimeout(copy._back);
            copy._back = setTimeout(() => swapText(copyLabel, T[lang()].copy), 1600);
        };
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
    fetch(lang() === 'de' ? '/cv.de.json' : '/cv.json').then(r => (r.ok ? r.json() : null)).then(cv => {
        const date = cv && cv.meta && cv.meta.lastModified;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { cvDate = date; showUpdated(); }
    }).catch(() => {});

    // Service pages and case studies link here with ?type=<kind of project>.
    const wanted = new URLSearchParams(location.search).get('type');
    const kind = form.elements.project_type;
    if (wanted && kind && Array.from(kind.options).some(o => o.value === wanted)) kind.value = wanted;

    localise();
    preview();

    // --- dropdowns ---------------------------------------------------------
    // The <select> stays in the form and holds the value, so the form, its JSON
    // twin and the page without scripts all read the same thing. On screen it is
    // replaced by a button and a list: a select-only combobox, worked with the
    // mouse, by touch, or with the arrow keys, Home, End, Enter, Escape and by
    // typing the start of an option.
    const SVG = 'http://www.w3.org/2000/svg';
    const closeMs = ms('--dropdown-close-dur', 150);
    function dropdown(select) {
        const wrap = select.closest('.select');
        const label = form.querySelector('label[for="' + select.id + '"]');
        if (!wrap || !label) return null;
        label.id = label.id || select.id + '-label';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'select-trigger';
        trigger.id = select.id + '-button';
        trigger.setAttribute('role', 'combobox');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', select.id + '-list');
        const value = document.createElement('span');
        value.className = 'select-value t-text-swap';
        value.id = select.id + '-value';
        trigger.appendChild(value);
        trigger.setAttribute('aria-labelledby', label.id + ' ' + value.id);

        const list = document.createElement('ul');
        list.className = 'select-list t-dropdown';
        list.id = select.id + '-list';
        list.setAttribute('role', 'listbox');
        list.setAttribute('aria-labelledby', label.id);
        list.setAttribute('data-origin', 'top-center');
        list.tabIndex = -1;
        list.hidden = true;
        const items = Array.from(select.options).map((option, i) => {
            const li = document.createElement('li');
            li.className = 'select-option';
            li.id = select.id + '-option-' + i;
            li.setAttribute('role', 'option');
            const text = document.createElement('span');
            text.textContent = option.textContent;
            const tick = document.createElementNS(SVG, 'svg');
            tick.setAttribute('class', 'select-check');
            tick.setAttribute('viewBox', '0 0 24 24');
            tick.setAttribute('fill', 'none');
            tick.setAttribute('stroke', 'currentColor');
            tick.setAttribute('stroke-width', '2.5');
            tick.setAttribute('stroke-linecap', 'round');
            tick.setAttribute('stroke-linejoin', 'round');
            tick.setAttribute('aria-hidden', 'true');
            const path = document.createElementNS(SVG, 'path');
            path.setAttribute('d', 'M5 12.5l4.5 4.5L19 7.5');
            tick.appendChild(path);
            li.append(text, tick);
            list.appendChild(li);
            return li;
        });

        let open = false;
        let active = -1;
        let closing = null;
        let typed = '';
        let typing = null;

        // What the select holds, shown on the button and ticked in the list.
        function show(animate) {
            const i = Math.max(0, select.selectedIndex);
            const text = select.options[i].textContent;
            if (animate && value.textContent !== text) swapText(value, text);
            else { clearTimeout(value._swap); value.classList.remove('is-exit'); value.textContent = text; }
            items.forEach((li, n) => li.setAttribute('aria-selected', n === i ? 'true' : 'false'));
        }
        function setActive(i) {
            active = Math.max(0, Math.min(items.length - 1, i));
            items.forEach((li, n) => li.classList.toggle('is-active', n === active));
            trigger.setAttribute('aria-activedescendant', items[active].id);
            if (list.scrollHeight > list.clientHeight) items[active].scrollIntoView({ block: 'nearest' });
        }
        // The list opens downwards, or upwards when only that side has the room.
        function place() {
            const box = trigger.getBoundingClientRect();
            const below = window.innerHeight - box.bottom;
            const above = box.top - (document.getElementById('header') || { offsetHeight: 0 }).offsetHeight;
            const need = list.offsetHeight + 14;
            list.setAttribute('data-origin', need > below && above > below ? 'bottom-center' : 'top-center');
        }
        function openList(at) {
            if (open) return;
            open = true;
            clearTimeout(closing);
            list.hidden = false;
            list.classList.remove('is-closing');
            place();
            void list.offsetWidth; // from hidden, so it grows out of the button
            list.classList.add('is-open');
            wrap.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            setActive(at == null ? Math.max(0, select.selectedIndex) : at);
        }
        function closeList() {
            if (!open) return;
            open = false;
            list.classList.remove('is-open');
            list.classList.add('is-closing');
            wrap.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.removeAttribute('aria-activedescendant');
            // The list is taken out of the page once its way out has run.
            closing = setTimeout(() => { list.classList.remove('is-closing'); list.hidden = true; }, closeMs);
        }
        function choose(i) {
            if (i !== select.selectedIndex) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event('input', { bubbles: true }));
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
            show(true);
        }
        // Typing the start of an option moves to it; the same letter again moves on.
        function type(char) {
            clearTimeout(typing);
            typed += char.toLowerCase();
            typing = setTimeout(() => { typed = ''; }, 600);
            const labels = items.map(li => li.textContent.trim().toLowerCase());
            const same = typed.split('').every(c => c === typed[0]);
            const from = open ? active : select.selectedIndex;
            const order = labels.map((_, n) => (from + (same ? 1 : 0) + n) % labels.length);
            const hit = order.find(n => labels[n].startsWith(same ? typed[0] : typed));
            if (hit == null) return;
            openList(hit);
            setActive(hit);
        }

        trigger.addEventListener('click', () => {
            trigger.focus(); // Safari does not focus a button on a click
            if (open) closeList(); else openList();
        });
        trigger.addEventListener('keydown', e => {
            if (e.ctrlKey || e.metaKey) return;
            const key = e.key;
            if (!open) {
                if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') { e.preventDefault(); openList(); }
                else if (key === 'Home') { e.preventDefault(); openList(0); }
                else if (key === 'End') { e.preventDefault(); openList(items.length - 1); }
                else if (key.length === 1 && !e.altKey) { e.preventDefault(); type(key); }
                return;
            }
            if (key === 'Escape') { e.preventDefault(); closeList(); }
            else if (key === 'ArrowUp' && e.altKey) { e.preventDefault(); choose(active); closeList(); }
            else if (key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
            else if (key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if (key === 'Home' || key === 'PageUp') { e.preventDefault(); setActive(0); }
            else if (key === 'End' || key === 'PageDown') { e.preventDefault(); setActive(items.length - 1); }
            else if (key === 'Enter' || (key === ' ' && !typed)) { e.preventDefault(); choose(active); closeList(); }
            else if (key === 'Tab') { choose(active); closeList(); }
            else if (key.length === 1 && !e.altKey) { e.preventDefault(); type(key); }
        });
        // Pressing in the list must not take the focus off the button.
        list.addEventListener('mousedown', e => e.preventDefault());
        items.forEach((li, i) => {
            li.addEventListener('click', () => { choose(i); closeList(); trigger.focus(); });
            li.addEventListener('pointermove', () => { if (active !== i) setActive(i); });
        });
        wrap.addEventListener('focusout', e => { if (!wrap.contains(e.relatedTarget)) closeList(); });
        document.addEventListener('pointerdown', e => { if (open && !wrap.contains(e.target)) closeList(); });
        // The label of a select puts the focus on it; a button would be pressed instead.
        label.addEventListener('click', e => { e.preventDefault(); trigger.focus(); });

        wrap.insertBefore(trigger, select);
        wrap.insertBefore(list, select.nextSibling);
        wrap.classList.add('is-enhanced');
        show(false);
        return { show };
    }
    const dropdowns = Array.from(form.querySelectorAll('.select select')).map(dropdown).filter(Boolean);
    // After a reset the selects are back at their first option; the buttons follow.
    form.addEventListener('reset', () => setTimeout(() => dropdowns.forEach(d => d.show(false)), 0));
})();
