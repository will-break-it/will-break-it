// Facts every page needs. The rate itself lives in public/hire.json so that
// the page, the structured data and the agent routes read one number.
import hire from '../../public/hire.json';

export type Lang = 'en' | 'de';
export const LANGS: Lang[] = ['en', 'de'];
export const ORIGIN = 'https://williwolff.com';
export const EMAIL = 'contact@williwolff.com';
export const PERSON_ID = `${ORIGIN}/#willi`;
export const RATE = hire.rate as { from: number; to: number; currency: string };

export const home = (lang: Lang) => (lang === 'de' ? '/de/' : '/');
export const abs = (path: string) => ORIGIN + path;
export const other = (lang: Lang): Lang => (lang === 'de' ? 'en' : 'de');

export const HOME = {
    en: {
        title: 'Willi Wolff – Freelance Software Engineer & Architect, Berlin',
        description: 'Freelance software engineer and architect in Berlin, available for contract work: AI agents, distributed systems, enterprise software, websites and mobile apps.',
        ogLocale: 'en_US',
    },
    de: {
        title: 'Willi Wolff – Freelance Software Engineer & Architekt, Berlin',
        description: 'Freiberuflicher Software Engineer und Architekt in Berlin, buchbar für Projekte: KI-Agenten, verteilte Systeme, Enterprise-Software, Websites und Mobile-Apps.',
        ogLocale: 'de_DE',
    },
} as const;

// Small dictionary for the parts written as components. The home page
// sections keep both languages side by side in src/partials.
export const T = {
    en: {
        nav: { work: 'Services', brief: 'Brief', cv: 'CV', projects: 'Projects', experience: 'Career' },
        sendBrief: 'Send a brief',
        switchLabel: 'DE: auf Deutsch umschalten',
        switchText: 'DE',
        forAgents: 'For agents',
        serviceKicker: 'Service',
        workKicker: 'Case study',
        facts: { client: 'Client', role: 'Role', period: 'Period', team: 'Team', stack: 'Stack', result: 'Result' },
        similar: 'Have something similar?',
        similarText: `Send a short brief and get one email back with fit, a rough scope, an estimate and the earliest start. ${RATE.from} to ${RATE.to} EUR per hour, by scope.`,
        proof: 'Proof',
        related: 'Related work',
        moreServices: 'Other services',
        relatedService: 'Service',
        markdown: 'This page as Markdown',
        back: 'Back to the overview',
        updated: 'Last updated',
        notFound: { title: 'This page does not exist.', text: 'The address may be old or mistyped.', home: 'Home', cv: 'CV', md: 'The site as Markdown' },
    },
    de: {
        nav: { work: 'Leistungen', brief: 'Anfrage', cv: 'Lebenslauf', projects: 'Projekte', experience: 'Werdegang' },
        sendBrief: 'Projekt anfragen',
        switchLabel: 'EN: switch to English',
        switchText: 'EN',
        forAgents: 'Für Agenten',
        serviceKicker: 'Leistung',
        workKicker: 'Fallstudie',
        facts: { client: 'Kunde', role: 'Rolle', period: 'Zeitraum', team: 'Team', stack: 'Stack', result: 'Ergebnis' },
        similar: 'Ein ähnliches Vorhaben?',
        similarText: `Schicken Sie eine kurze Anfrage und Sie bekommen eine E-Mail zurück: Passung, grober Umfang, Schätzung und frühester Start. ${RATE.from} bis ${RATE.to} EUR pro Stunde, je nach Umfang.`,
        proof: 'Belege',
        related: 'Passende Projekte',
        moreServices: 'Weitere Leistungen',
        relatedService: 'Leistung',
        markdown: 'Diese Seite als Markdown',
        back: 'Zurück zur Übersicht',
        updated: 'Stand',
        notFound: { title: 'Diese Seite gibt es nicht.', text: 'Die Adresse ist vermutlich veraltet oder vertippt.', home: 'Startseite', cv: 'Lebenslauf', md: 'Die Seite als Markdown' },
    },
} as const;
