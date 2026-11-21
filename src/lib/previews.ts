// The image a shared link shows on LinkedIn, Slack, WhatsApp and others.
// Every page has its own: the home pages show the offer, a service page or
// case study shows its title and one line of proof. This module only decides
// what each card says; scripts/build-previews.mjs draws them.

import { type Lang, T } from './site';
import { type Entry, entries } from './content';

export interface Card {
    /** Path of the image on the site. */
    image: string;
    lang: Lang;
    kind: 'home' | 'services' | 'work';
    /** Small line above the title; none on the home cards. */
    kicker: string;
    /** *asterisks* mark the part set in the brand colour. */
    title: string;
    line: string;
    alt: string;
}

const HOME_CARDS: Record<Lang, Card> = {
    en: {
        image: '/social-preview.png',
        lang: 'en',
        kind: 'home',
        kicker: '',
        title: 'Software engineer and architect for *contract work*.',
        line: 'AI agents · Distributed systems · Enterprise software · Web and mobile',
        alt: 'Willi Wolff, software engineer and architect for contract work: AI agents, distributed systems, enterprise software, web and mobile',
    },
    de: {
        image: '/social-preview.de.png',
        lang: 'de',
        kind: 'home',
        kicker: '',
        title: 'Software Engineer und Architekt, *als Freelancer buchbar*.',
        line: 'KI-Agenten · Verteilte Systeme · Enterprise-Software · Web und Mobile',
        alt: 'Willi Wolff, Software Engineer und Architekt, als Freelancer buchbar: KI-Agenten, verteilte Systeme, Enterprise-Software, Web und Mobile',
    },
};

export const homeCard = (lang: Lang): Card => HOME_CARDS[lang];

export function entryCard(entry: Entry): Card {
    const isWork = entry.kind === 'work';
    const kicker = isWork ? T[entry.lang].workKicker : T[entry.lang].serviceKicker;
    // A case study leads with its result, a service with its technologies.
    const line = (isWork ? entry.facts.result : entry.facts.stack) ?? '';
    return {
        image: `/og/${isWork ? 'work' : 'service'}-${entry.key}.${entry.lang}.png`,
        lang: entry.lang,
        kind: entry.kind,
        kicker,
        title: entry.title,
        line,
        alt: `${kicker}: ${entry.title}. ${line}`,
    };
}

export const cards = (): Card[] => [homeCard('en'), homeCard('de'), ...entries.map(entryCard)];
