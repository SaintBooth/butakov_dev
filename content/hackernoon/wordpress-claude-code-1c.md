# I Replaced a Dev Team With Claude Code to Build a Store. Here's What Broke.

Client needed an online store. Synced to their inventory system in real time, matched to an existing React prototype down to the pixel, on a budget that ruled out every platform an agency would normally reach for. I built it solo: WordPress, WooCommerce, and Claude Code writing most of the code while I handled the architecture and reviewed everything it touched. Not the demo-reel version of AI coding. The actual one, with the actual bugs.

Strip out the Russia-specific details and the shape of this will feel familiar to a lot of US freelancers and small agencies: a client with a real inventory system behind them, a design that has to be reproduced exactly rather than approximated, and a budget too small for the platform everyone in the industry defaults to.

## The default answer was too expensive, and it didn't fit the design

Inventory lives in 1C, the ERP and point-of-sale system running most Russian retail, a corporate accounting platform that only talks to the outside world through XML. Ask a Russian developer how to sync a site with 1C and you get the same answer every time: build on Bitrix. It's the dominant commercial CMS there, it ships a stock 1C exchange module, and there's a whole industry of integrators who already know how to bill for it. Every market has its own version of this. Whatever the local business-software incumbent is, some platform built a plugin for it years ago, and agencies default to that plugin because it's what they already know how to staff.

For a one-location boutique, that default falls apart twice.

Cost first. License, annual renewal, integrator fees: add it up and you're close to the entire budget of this open source build, before a single feature exists. Hard to defend for one retail location.

Then design. The client didn't want a theme with a catalog bolted on. They had a React prototype already: a specific quiet-luxury look, four colors, Lora paired with Raleway, zero border radius on everything, and they wanted it copied exactly, not approximated. Forcing that onto a stock theme takes longer than just writing one.

None of the actual requirements got smaller because the budget did. Real-time stock from 1C, and clothing means variable products, so every size-color pair carries its own count. Card and instant-payment processing through a local processor. Courier delivery. A cookie banner and consent checkboxes for Russia's privacy law. Ecommerce event tracking. All of it, on a budget that assumed almost none of it would be needed.

So the bet: a free stack, WordPress and WooCommerce, plus an AI agent standing in for the team I couldn't afford to hire.

## The stack

- CMS: WordPress with a fully block-based theme (FSE) built from scratch, no page builder plugins
- E-commerce: WooCommerce and WooCommerce Blocks, mini cart through the Store API
- Backend: PHP 8, a modular `inc/` structure, custom fields registered in code instead of through an admin UI
- Frontend: plain ES modules, no jQuery, `IntersectionObserver` for scroll animations, `history.pushState` for filter state, icons as an inline SVG sprite
- Design tokens: `theme.json` as the single source of truth, with CSS variables generated from it
- ERP sync: 1C over the CommerceML protocol, real time
- Payments and logistics: local card and instant-payment processing, courier delivery, email, analytics
- Hosting: a Russian hosting provider, deployed over SSH
- AI tooling: Claude Code, plus MCP servers for Playwright browser checks and SSH deploys

### A block theme as the design system, not a page builder

No Elementor. No page builder plugin, period. On a budget project that's not taste, it's arithmetic: every builder plugin costs you performance, ties you to somebody else's release schedule, and inserts a layer between the design and the code you actually control.

Design tokens from the React prototype moved straight into `theme.json`, WordPress's native token file. Four colors. An 8px spacing scale. Two typefaces. WordPress turns that into CSS variables on its own, and every stylesheet in the theme touches only those variables, never a raw value:

```css
:root {
  --color-bone: /* background, roughly 70% of the canvas */;
  --color-ink: /* text and UI */;
  --color-bordeaux: /* sale badges and accents */;
  --color-pine: /* dark navigation */;
}
```

Text hierarchy runs on transparent variants of the ink color instead of a pile of grays, and border radius sits at zero everywhere except the pill-shaped tags. That one rule caused more arguments with the agent than anything else on the project, more on that in a second.

The PHP layer stays deliberately boring. `functions.php` does nothing but wire up modules:

```php
// functions.php: wiring only, no logic
require_once get_theme_file_path( 'inc/setup.php' );
require_once get_theme_file_path( 'inc/assets.php' );
require_once get_theme_file_path( 'inc/woocommerce.php' );
require_once get_theme_file_path( 'inc/ajax-handlers.php' );
```

One file, one job. Repeating sections turned into block patterns, header and footer became template parts, and WooCommerce's default templates got overridden exactly where the stock markup broke the design, nowhere else.

## What vibe coding looks like on a real project, not a demo

The agent didn't build this alone. It wrote most of the code; I did the architecture, broke the work into tasks, and reviewed what came back. That's not less work than building it by hand, for what it's worth. It's the same amount of thinking, just compressed into review instead of typing.

Three things kept it from falling apart, and the first one mattered more than I expected going in.

Claude Code reads a project instructions file, `CLAUDE.md`, at the start of every session. I dumped the entire design system into it as flat prohibitions: exactly four colors, no raw hex anywhere in the codebase, radius is zero, headings are uppercase with letter spacing, spacing only comes off the 8px scale. Leave an LLM alone and it improvises constantly, cheerfully, and exactly the way that wrecks a tight design system. With the rule sitting there in black and white, when the agent needs a new shade it doesn't reach for a hex code, it derives one with `oklch()` off an existing token, because the file tells it that's the only move on the table.

Memory came next, and it mattered because the agent's context resets and this project didn't, it ran for months. Every real lesson, "WooCommerce Blocks doesn't load jQuery," "1C's delta exports quietly wipe out product variations," got written down in a markdown file the agent rereads on the next session. New session, same traps already mapped. It's basically an external long-term memory for the engineering work, except the one reading the notes is an agent and not me trying to remember what broke six weeks ago.

And then verification, which I'd fight hardest to keep if someone told me to cut a corner somewhere. The agent has Playwright access through MCP: it opens the live page itself, clicks through the actual flow, takes a screenshot, and compares it to the prototype, instead of me squinting at a screenshot and taking its word for it. Rule: no "fixed" without a real check behind it. That rule paid for itself on a bug where product card links quietly stopped working, only on desktop, only in production, which is about the worst combination of "only" you can get handed. The agent reproduced it with an actual click through Playwright and traced it to `setPointerCapture` inside the image carousel, which was grabbing pointer events and redirecting the click from the product link onto the carousel track underneath it. Nobody was finding that by staring at the carousel code. It looked fine. It was fine, mostly.

Where it falls down, and I mean this as a flat statement, not a complaint: it will confidently fix the wrong root cause if you don't force a reproduction first. It drifts outside the design system the second a rule gets fuzzy instead of explicit. It loses the thread on anything long without something external reminding it what already happened. All three are process failures, not model failures, which is the entire reason this piece is about process and barely touches prompting.

## The ERP integration: the part nobody warns you about

This ate more hours than everything else in the project combined, and it's the part that matters most if you're wiring any ERP or POS system into an ecommerce platform over an XML feed, not just this specific stack.

The sync runs on CommerceML, an XML exchange protocol: the ERP exports packets on a schedule and on events (real-time mode was on here), a plugin on the WordPress side parses them, catalog updates. Simple as a diagram. The traps are all in the details, and since CommerceML is a Russian national standard, the XML element names in the snippet below are genuinely Russian words. Not obfuscation, just the protocol.

First bug: stock counts that weren't real. The storefront showed wrong numbers even though the sync ran clean, no errors, no warnings, everything green. Took diffing raw XML against what actually landed in the database to find it. In the protocol version we were on, stock arrives in separate files with a nested structure, split per warehouse:

```xml
<Предложение>
  <Ид>product-guid#variation-guid</Ид>
  <Остатки>
    <Остаток>
      <Склад>
        <Ид>warehouse-guid</Ид>
        <Количество>3</Количество>
      </Склад>
    </Остаток>
  </Остатки>
</Предложение>
```

The plugin's parser expected a flat quantity field one level up and silently skipped the nested version. No error anywhere in the pipeline. The sync reports success. The data is just wrong, and nothing tells you that. Patched the parser, and I've diffed the plugin's code before every update since, because the next release could bring that bug back without so much as a changelog note.

Two more surfaced close together. Product properties and variation characteristics turned out to be handled as two unrelated mechanisms in this protocol, separate code paths entirely, so a color set up as a property and a size set up as a characteristic land in WooCommerce through completely different logic. Trace both paths independently or the result is basically a coin flip. And the fast sync sends delta chunks instead of the full catalog on every run, which sounds efficient right up until you notice the plugin was rebuilding each product's entire variation set from whatever chunk it received, meaning any variation missing from that one chunk just vanished. The size range was draining out from under us for I don't know how long before anyone noticed, probably the client before me, honestly. Fixed with a mode that preserves variations across partial exports, plus a cleanup pass, since roughly a thousand orphaned variations had piled up in the database by the time we caught it.

Last one, smaller: attribute terms were getting created with GUID slugs instead of readable ones, which broke filter URLs and made the admin panel borderline unreadable. Mapping table, repair script that runs after every sync, done.

Honest takeaway: an ERP-to-WordPress sync can run reliably in production. Ours does, real time. But "install the plugin and walk away" was never on the table. Budget the time to read the plugin's source, patch its parser, and write your own verification scripts, because the vendor's tests, if they exist, aren't testing for your data.

## The layer nobody puts in the estimate

Payments, shipping, email: the boring standard part. Local card and instant-payment processing, courier integration, transactional email, ecommerce analytics events. Swap in a different processor, a different carrier API, a different analytics platform, and this part of the work barely changes no matter which country you're building in.

What gets skipped in estimates is compliance. Russia has its own privacy law; most other markets have a version of the same thing, a national statute somewhere, a state-level one somewhere else. Cookie banner, consent checkboxes on every form, terms accepted at checkout. None of it is technically hard. All of it shows up in the last week of a project and moves the deadline, every time, if nobody planned for it up front.

## WooCommerce Blocks quietly dropped jQuery, and a lot of tutorials haven't caught up

Modern WooCommerce with block templates does not load jQuery on the storefront. At all. Every classic tutorial snippet built on `$('.variations_form').on('found_variation', …)` has nothing left to hook into anymore, and there are still a lot of those tutorials ranking on page one. For a block theme I had to write a native variation resolver from scratch: collect the selected attributes, match them against the variation data, update price, photo, availability.

```js
// No jQuery here: WooCommerce Blocks doesn't load it.
const match = variations.find((v) =>
  Object.entries(selected).every(
    ([attr, value]) => !v.attributes[attr] || v.attributes[attr] === value
  )
);
```

Same story everywhere else in the frontend. AJAX catalog filters render inside the block product template. Filter state lives in the URL through `history.pushState`, so a filtered link survives being forwarded to someone else. The mini cart runs on the Store API. Scroll animations use `IntersectionObserver` and respect `prefers-reduced-motion`. None of it is exotic, it's just modern frontend work that WordPress still makes you assemble by hand.

## What shipped

A working store on a custom block theme that matches the prototype, genuinely, not "close enough." Catalog with AJAX filtering, variable product cards with size and color options, a wishlist, product pages with a swipe gallery on mobile.

Real-time sync with the ERP. Prices, stock, and variations arrive without anyone touching a spreadsheet, and after the stock parser fix, the storefront numbers actually match the warehouse.

Local payments live. Courier delivery live. Privacy compliance closed out.

The client sent two full rounds of revisions, about thirty items between them, everything from typography tweaks to restructuring entire blocks. Each round cleared in a few days, not weeks. Total build time landed in weeks, not months.

And the budget number holds up: zero dollars in platform licenses. WordPress, WooCommerce, the rest of the stack, all open source. The client's money went to actual work and hosting instead of a renewal invoice for a boxed platform.

## When this approach fits, and when it doesn't

Fits a small or mid-size store: custom design, an ERP that isn't a deep enterprise system, a budget that actually constrains the platform choice, and a developer willing to read exchange XML instead of just clicking through a plugin's settings screen.

Doesn't fit a high-volume marketplace pushing thousands of orders a day. Doesn't fit real-time multi-warehouse reservation logic. Doesn't fit a client whose procurement process demands vendor support contracts on paper. In those cases a boxed platform, or a custom build on something heavier, earns what it costs.

On the AI part specifically: Claude Code didn't replace a developer here. It replaced part of a team. I wouldn't have shipped something this size alone, on this timeline, without it, or I'd have shipped it on a completely different budget, one of those two. But hand the same agent a project with no rules file, no memory between sessions, and no requirement to verify its own claims, and it will produce code that's confident and wrong in roughly equal measure. Building that process around it mattered more than any prompt I ever wrote.

---

_I build web stores and internal tools, usually pairing solo development with AI coding agents to hit budgets a traditional agency team can't match. I write more of this at [butakov.dev](https://butakov.dev). Questions about the 1C integration or the Claude Code workflow, find me on [Telegram](https://t.me/SashaBooth) or [GitHub](https://github.com/SaintBooth)._

<!--
HACKERNOON SUBMISSION SETTINGS (not part of the article body, strip before pasting into the editor)

Tags (8 max, 30 chars each):
1. claude-code
2. ai-agents
3. vibe-coding
4. wordpress
5. ecommerce
6. web-development
7. software-development
8. artificial-intelligence

Meta description (155 chars):
A solo developer paired with Claude Code to build a real WooCommerce store synced to a 1C ERP, then documented every bug the AI agent caused along the way.

TL;DR (440 chars):
A solo developer built a production WooCommerce store for a clothing brand, synced in real time to a 1C ERP, with Claude Code writing most of the code. The budget ruled out enterprise commerce platforms, so the build ran on open source software instead. This piece breaks down the workflow behind that setup, a rules file, memory between sessions, mandatory browser verification, plus four specific ERP sync bugs and how each one got fixed.

First Seen At:
This is a rewritten/localized adaptation of a case already live at https://butakov.dev/en/journal/wordpress-claude-code-1c (same project, different framing, examples, and most of the sentences). Recommend filling "First Seen At" with that URL rather than leaving it blank, since HackerNoon treats an undeclared republish/derivative as plagiarism. If you'd rather this count as fully original, that's a judgment call, but blank + high textual overlap is the risky combination.

Featured image: none picked yet, required before submission (any image, own screenshot of the storefront or theme.json/token palette works, avoid stock photography).
-->
