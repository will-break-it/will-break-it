// Home page behaviour: project figures and filters, the contribution grid,
// collapsible career entries and expandable project descriptions.

const html = document.documentElement;
// Each page is one language. Text this script inserts has to be in it too:
// nothing hides the other language any more.
const pageLang = html.getAttribute('data-lang') === 'de' ? 'de' : 'en';

// Collapsible job sections
document.addEventListener('click', function(e) {
    const jobHeader = e.target.closest('.job-header');
    if (jobHeader) {
        const job = jobHeader.closest('.job');
        job.classList.toggle('expanded');
    }
});

// ===================================================================
// Digit reels
// ===================================================================
// Key numbers render one tile per digit. Each tile holds a 0-9 strip
// that spins to its digit the first time the number scrolls into view,
// right-most digit first (after transitions.dev's spinning counter).

const reelObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-spun');
            reelObserver.unobserve(e.target);
        });
    }, { threshold: 0.4 })
    : null;

function reel(value, opts) {
    const o = opts || {};
    const text = String(value);
    const digits = text.split('');
    const strip = Array.from({ length: 10 }, (_, i) => `<span>${i}</span>`).join('');
    const tiles = digits.map((ch, i) => {
        if (!/[0-9]/.test(ch)) return `<span class="reel-sep">${ch}</span>`;
        const delay = (digits.length - 1 - i) * 70;
        return `<span class="reel-digit" style="--d:${ch};--delay:${delay}ms">` +
            `<span class="reel-strip">${strip}</span></span>`;
    }).join('');
    return `<span class="reel${o.accent ? ' reel--accent' : ''}" aria-label="${text}">${tiles}</span>`;
}

function spinReels(root) {
    root.querySelectorAll('.reel').forEach(r => {
        if (reelObserver) reelObserver.observe(r); else r.classList.add('is-spun');
    });
}

// ===================================================================
// Career stats
// ===================================================================
// Numbers live in data/stats.json so they can be edited without going
// near the markup. The same file names the failed projects, which is
// what puts the badge on the matching card, so the count at the top and
// the badges further down can never disagree.

(function () {
    const projectRow = document.querySelector('[data-stats="projects"]');
    if (!projectRow) return;

    const LABELS = {
        all: { en: 'Projects', de: 'Projekte' },
        live: { en: 'Live', de: 'Live' },
        building: { en: 'In progress', de: 'In Arbeit' },
        failed: { en: 'Failed', de: 'Gescheitert' },
    };

    // Every figure is also a filter for the project grid below.
    function figure(key, value, opts) {
        const o = opts || {};
        const title = o.title ? ` title="${o.title.replace(/"/g, '&quot;')}"` : '';
        return `<button type="button" class="figure" data-filter="${key}"${title}>` +
            `<span class="figure-value">${reel(value, { accent: o.accent })}</span>` +
            `<span class="figure-label">${LABELS[key][pageLang]}</span></button>`;
    }

    const cards = Array.from(document.querySelectorAll('.project-card'));
    const groups = Array.from(document.querySelectorAll('.project-group'));
    const note = document.querySelector('[data-filter-note]');
    const noteLabel = note && note.querySelector('[data-filter-label]');

    function applyFilter(key) {
        const matches = card => key === 'all' ||
            (key === 'building' ? card.dataset.building === 'true' : card.dataset.status === key);
        cards.forEach(card => { card.hidden = !matches(card); });
        groups.forEach(g => {
            const shown = g.querySelectorAll('.project-card:not([hidden])').length;
            g.hidden = !shown;
            const count = g.querySelector('.group-count');
            if (count) count.textContent = shown;
        });
        projectRow.querySelectorAll('.figure').forEach(b => {
            b.setAttribute('aria-pressed', b.dataset.filter === key && key !== 'all' ? 'true' : 'false');
        });
        if (!note) return;
        note.hidden = key === 'all';
        if (key !== 'all') {
            const n = cards.filter(c => !c.hidden).length;
            noteLabel.textContent = pageLang === 'de'
                ? `${n} × ${LABELS[key].de}`
                : `Showing ${n} ${LABELS[key].en.toLowerCase()}`;
        }
    }

    fetch('/data/stats.json', { cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(data => {
            const projects = data.projects || [];
            const byStatus = s => projects.filter(p => p.status === s);
            const failures = byStatus('failed');

            const de = (document.documentElement.getAttribute('data-lang') || 'en') === 'de';
            const why = f => (f.why ? (de && f.why.de) || f.why.en : '');
            const detail = failures
                .map(f => `${f.project || f.card.replace(/^p-/, '')} (${f.year})${why(f) ? ': ' + why(f) : ''}`)
                .join('\n');

            // Counts are derived from the project list, never typed, so
            // the number and what the filter shows cannot disagree.
            projectRow.innerHTML =
                figure('all', projects.length) +
                figure('live', byStatus('live').length) +
                figure('building', projects.filter(p => p.building).length) +
                figure('failed', failures.length, { accent: true, title: detail });
            spinReels(projectRow);

            projects.forEach(p => {
                const card = p.card && document.getElementById(p.card);
                if (!card) return;
                card.dataset.status = p.status;
                if (p.building) card.dataset.building = 'true';

                // One plain status line above the description. Failed and
                // handed over are different claims and must not read alike:
                // handed over means it still runs, just not by me.
                const STATUS = {
                    live: { en: 'Live', de: 'Live' },
                    'handed-over': { en: 'Handed over', de: 'Übergeben' },
                    failed: { en: 'Failed', de: 'Gescheitert' },
                    upstream: { en: 'Merged upstream', de: 'Upstream übernommen' },
                    archived: { en: 'Archived', de: 'Archiviert' },
                };
                const st = p.building ? { en: 'In progress', de: 'In Arbeit' } : STATUS[p.status];
                const desc = card.querySelector('.project-description');
                if (!st || !desc) return;
                const year = p.year ? ` ${p.year}` : '';
                // After the dot: why it ended, or a headline figure.
                const after = p.why || p.metric;
                const why = after ? { en: ` · ${after.en}`, de: ` · ${after.de || after.en}` } : { en: '', de: '' };
                const line = document.createElement('p');
                line.className = 'project-status';
                line.dataset.state = p.building ? 'building' : p.status;
                line.innerHTML = `<span><b>${st[pageLang]}${year}</b>${why[pageLang]}</span>`;
                desc.parentNode.insertBefore(line, desc);
            });

            projectRow.addEventListener('click', function (e) {
                const btn = e.target.closest('[data-filter]');
                if (!btn) return;
                applyFilter(btn.dataset.filter);
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            });
            const clear = document.querySelector('[data-filter-clear]');
            if (clear) clear.addEventListener('click', () => applyFilter('all'));
        })
        .catch(() => {
            // Without the file there are no numbers to show, so the row
            // stays empty rather than displaying placeholders.
        });
})();

// ===================================================================
// Activity
// ===================================================================
// Reads the file the nightly workflow commits. Month buckets only: this
// data cannot describe a single day, so it cannot imply an idle one.
// If the file is missing the whole panel stays hidden rather than
// rendering zeros.

(function () {
    const panel = document.querySelector('[data-activity="panel"]');
    if (!panel) return;

    const lang = () => html.getAttribute('data-lang') || 'en';

    function relative(iso) {
        const then = new Date(iso);
        const hours = Math.floor((Date.now() - then.getTime()) / 36e5);
        const de = lang() === 'de';
        if (hours < 1) return de ? 'gerade eben' : 'just now';
        if (hours < 24) return `${hours}h ${de ? 'her' : 'ago'}`;
        const days = Math.floor(hours / 24);
        if (days === 1) return de ? 'gestern' : 'yesterday';
        if (days < 30) return `${days} ${de ? 'Tage her' : 'days ago'}`;
        const months = Math.floor(days / 30);
        return `${months} ${de ? 'Monate her' : 'months ago'}`;
    }

    fetch('/data/activity.json', { cache: 'no-cache' })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then(data => {
            const de = lang() === 'de';
            const window12 = data.last12Months;

            const fmt = v => v.toLocaleString(de ? 'de-DE' : 'en-US');
            const sinceYear = (data.since || '').slice(0, 4);
            panel.querySelector('[data-activity="summary"]').textContent = de
                ? `${fmt(data.totals.contributions)} seit ${sinceYear} · ${fmt(data.totals.pullRequests)} Pull Requests`
                : `${fmt(data.totals.contributions)} since ${sinceYear} · ${fmt(data.totals.pullRequests)} pull requests`;

            // GitHub's own layout: one column per week, Sunday on top,
            // the current week on the right. Levels follow a log scale so
            // a 500-commit day does not wash out every ordinary one.
            const byDay = new Map((data.days || []).map(d => [d.date, d.total]));
            const iso = d => d.toISOString().slice(0, 10);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            const start = new Date(today);
            start.setUTCDate(start.getUTCDate() - 52 * 7 - today.getUTCDay());
            const days = [];
            for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
                days.push({ date: iso(d), total: byDay.get(iso(d)) || 0, month: d.getUTCMonth(), dom: d.getUTCDate() });
            }
            const max = Math.max(1, ...days.map(d => d.total));
            const level = v => (v <= 0 ? 0 : Math.max(1, Math.ceil(4 * Math.log(1 + v) / Math.log(1 + max))));
            const grid = panel.querySelector('[data-activity="grid"]');
            const totalWeeks = Math.ceil(days.length / 7);
            grid.setAttribute('aria-label', de
                ? `${fmt(window12.total)} GitHub-Beiträge in den letzten 12 Monaten`
                : `${fmt(window12.total)} GitHub contributions in the last 12 months`);

            // Hover (or tap) a day for its count, the way GitHub does.
            const tip = panel.querySelector('[data-activity="tip"]');
            const dayFmt = new Intl.DateTimeFormat(de ? 'de-DE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
            const showTip = cell => {
                const d = days[+cell.dataset.i];
                const when = dayFmt.format(new Date(d.date + 'T00:00:00Z'));
                const n = d.total;
                tip.textContent = de
                    ? `${n ? fmt(n) : 'Keine'} ${n === 1 ? 'Beitrag' : 'Beiträge'} am ${when}`
                    : `${n ? fmt(n) : 'No'} contribution${n === 1 ? '' : 's'} on ${when}`;
                tip.hidden = false;
                const host = tip.parentElement.getBoundingClientRect();
                const r = cell.getBoundingClientRect();
                const x = r.left - host.left + r.width / 2;
                const half = tip.offsetWidth / 2;
                const max = tip.parentElement.clientWidth - half;
                tip.style.left = `${Math.min(Math.max(x, half), max)}px`;
                tip.style.top = `${r.top - host.top - 6}px`;
            };
            grid.addEventListener('mouseover', e => { if (e.target.matches('i')) showTip(e.target); });
            grid.addEventListener('click', e => { if (e.target.matches('i')) showTip(e.target); });
            grid.addEventListener('mouseleave', () => { tip.hidden = true; });
            const monthNames = Array.from({ length: 12 }, (_, m) =>
                new Date(Date.UTC(2020, m, 1)).toLocaleString(de ? 'de-DE' : 'en-US', { month: 'short', timeZone: 'UTC' }));
            const months = panel.querySelector('[data-activity="months"]');

            // Show as many recent weeks as fit at a readable cell size
            // instead of scrolling sideways: a full year on desktop,
            // the last few months on a phone.
            let shown = 0;
            const draw = () => {
                if (!grid.clientWidth) return;
                const fit = Math.max(13, Math.min(totalWeeks, Math.floor((grid.clientWidth + 3) / 13)));
                if (fit === shown) return;
                shown = fit;
                const first = (totalWeeks - fit) * 7;
                grid.style.setProperty('--weeks', fit);
                months.style.setProperty('--weeks', fit);
                grid.innerHTML = days.slice(first).map((d, j) =>
                    `<i data-level="${level(d.total)}" data-i="${first + j}" style="--i:${Math.floor(j / 7)}"></i>`).join('');
                months.innerHTML = Array.from({ length: fit }, (_, w) => {
                    const d = days[first + w * 7];
                    const label = d && d.dom <= 7 && w > 0 && w < fit - 2 ? monthNames[d.month] : '';
                    return `<span>${label}</span>`;
                }).join('');
            };
            // The panel may still be hidden here; draw once it has a width.
            if ('ResizeObserver' in window) new ResizeObserver(draw).observe(grid);
            else { draw(); window.addEventListener('resize', draw, { passive: true }); }
            if (reelObserver) {
                const grow = new IntersectionObserver(es => es.forEach(e => {
                    if (e.isIntersecting) { grid.classList.add('is-in'); grow.disconnect(); }
                }), { threshold: 0.3 });
                grow.observe(grid);
            } else {
                grid.classList.add('is-in');
            }



            // The stats block may not have rendered its context line yet,
            // so park the value where it can pick it up either way.
            document.documentElement.dataset.publicRepos = data.totals.publicRepositories;
            document.querySelectorAll('[data-activity="repos"]').forEach(el => {
                el.textContent = data.totals.publicRepositories;
            });

            const push = document.querySelector('[data-activity="lastpush"]');
            if (push && data.lastPush) {
                // Timestamp only. Which repo it landed in is either a
                // private name we will not print or noise up here.
                const when = relative(data.lastPush.at);
                push.textContent = `${lang() === 'de' ? 'letzter Push' : 'last push'} ${when}`;
                push.hidden = false;
            }

            panel.hidden = false;
        })
        .catch(() => {
            // Nothing to say, so say nothing. Better than a graph of zeros.
        });
})();

// Header nav: mark the section currently being read.
(function () {
    const links = Array.from(document.querySelectorAll('.site-nav a'));
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        const current = sections.find(s => visible.has(s));
        if (!current) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    }, { rootMargin: '-80px 0px -60% 0px' });
    sections.forEach(s => observer.observe(s));
})();

// Descriptions show three lines; "More" expands one card at a time.
(function () {
    document.querySelectorAll('.project-description').forEach(desc => {
        const card = desc.closest('.project-card');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'project-more';
        btn.setAttribute('aria-expanded', 'false');
        const label = open => (pageLang === 'de' ? (open ? 'Weniger' : 'Mehr') : (open ? 'Less' : 'More'));
        btn.textContent = label(false);
        desc.after(btn);
        const sync = () => { btn.hidden = !card.classList.contains('is-open') && desc.scrollHeight <= desc.clientHeight + 1; };
        btn.addEventListener('click', () => {
            const open = card.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', String(open));
            btn.textContent = label(open);
        });
        sync();
        window.addEventListener('resize', sync, { passive: true });
    });
})();
