---
title: I replaced most of a dev team with Claude Code to build a production e-commerce store. Here's what broke.
published: true
description: A solo dev builds a real WooCommerce store synced to a 1C ERP with Claude Code writing most of the code, and documents every bug the agent caused along the way.
tags: showdev, ai, wordpress, webdev
canonical_url: https://butakov.dev/en/journal/wordpress-claude-code-1c
cover_image:
---

First post here. Figured a real project beats an introduction post, so: here's one, warts included.

A women's clothing brand needed an online store synced to their inventory system, matched to an existing React prototype pixel for pixel, on a budget that ruled out the usual enterprise platforms. I built it solo: WordPress, WooCommerce, and Claude Code writing most of the code while I did the architecture and reviewed everything it touched. Not the demo-reel version of AI coding. The one with the actual bugs.

## The default answer was too expensive, and it didn't fit the design

The client's inventory lives in 1C, the ERP and point-of-sale system that runs most Russian retail, a corporate accounting platform that only talks to the outside world through XML. Ask around for how to sync a site with it and you get the same answer every time: build on Bitrix, the dominant commercial CMS there, which ships a stock exchange module and a pool of integrators who already know how to bill for it. Every market has its own version of this. Whatever the local business-software incumbent is, some platform built a plugin for it years ago, and agencies default to it because that's what they already know how to staff.

For a one-location boutique, that default breaks on two fronts.

Cost first. License, annual renewal, integrator fees: add it up and you're close to the entire budget of this open source build, before a single feature exists.

Then design. The client had a React prototype already, a specific quiet-luxury look, four colors, two typefaces, zero border radius everywhere, and wanted it copied exactly, not approximated. Forcing that onto a stock theme takes longer than writing one from scratch.

None of the actual requirements got smaller because the budget did: real-time stock from an ERP where every size-color pair carries its own count, card and instant-payment processing through a local processor, courier delivery, a cookie banner and consent checkboxes for local privacy law, ecommerce event tracking. All of it, on a budget that assumed almost none of it.

## The stack

- CMS: WordPress with a fully block-based theme (FSE) built from scratch, no page builder plugins
- E-commerce: WooCommerce and WooCommerce Blocks, mini cart through the Store API
- Backend: PHP 8, a modular `inc/` structure, custom fields registered in code instead of through an admin UI
- Frontend: plain ES modules, no jQuery, `IntersectionObserver` for scroll animations, `history.pushState` for filter state
- Design tokens: `theme.json` as the single source of truth, CSS variables generated from it
- ERP sync: CommerceML protocol, real time
- AI tooling: Claude Code, plus MCP servers for Playwright browser checks and SSH deploys

### A block theme instead of a page builder

No Elementor, no page builder plugin of any kind. On a budget project that's arithmetic, not taste: every builder plugin costs you performance, ties you to somebody else's release schedule, and inserts a layer between the design and the code you actually control.

Design tokens moved straight into `theme.json`, WordPress's native token file. Four colors, an 8px spacing scale, two typefaces. WordPress turns that into CSS variables on its own, and every stylesheet touches only those variables, never a raw value:

```css
:root {
  --color-bone: /* background, roughly 70% of the canvas */;
  --color-ink: /* text and UI */;
  --color-bordeaux: /* sale badges and accents */;
  --color-pine: /* dark navigation */;
}
```

Border radius sits at zero everywhere except pill-shaped tags. That one rule caused more arguments with the agent than anything else on the project, more on that in a second.

`functions.php` does nothing but wire up modules:

```php
// functions.php: wiring only, no logic
require_once get_theme_file_path( 'inc/setup.php' );
require_once get_theme_file_path( 'inc/assets.php' );
require_once get_theme_file_path( 'inc/woocommerce.php' );
require_once get_theme_file_path( 'inc/ajax-handlers.php' );
```

One file, one job. Repeating sections became block patterns, header and footer became template parts, and WooCommerce's default templates got overridden only where the stock markup broke the design.

## What vibe coding looks like on a real project

The agent didn't build this alone. It wrote most of the code; I did the architecture, broke the work into tasks, and reviewed what came back. That's not less work than building it by hand. It's the same amount of thinking, compressed into review instead of typing.

Three things kept it from falling apart, and the first one mattered more than I expected going in.

Claude Code reads a project instructions file, `CLAUDE.md`, at the start of every session. I put the entire design system in there as flat prohibitions: exactly four colors, no raw hex anywhere in the codebase, radius is zero, spacing only off the 8px scale. Leave an LLM alone and it improvises constantly, cheerfully, and exactly the way that wrecks a tight design system. With the rule sitting there in black and white, when the agent needs a new shade it doesn't reach for a hex code, it derives one with `oklch()` off an existing token, because the file tells it that's the only move on the table.

Memory came next, because the agent's context resets and this project didn't, it ran for months. Every real lesson, "WooCommerce Blocks doesn't load jQuery," "the ERP's delta exports quietly wipe out product variations," got written down in a markdown file the agent rereads on the next session. New session, same traps already mapped.

And then verification, which I'd fight hardest to keep if someone told me to cut a corner. The agent has Playwright access through MCP: it opens the live page itself, clicks through the actual flow, takes a screenshot, and compares it to the prototype, instead of me squinting at a screenshot and taking its word for it. Rule: no "fixed" without a real check behind it. That rule paid for itself on a bug where product card links quietly stopped working, only on desktop, only in production. The agent reproduced it with an actual click through Playwright and traced it to `setPointerCapture` inside the image carousel, which was grabbing pointer events and redirecting the click from the product link onto the carousel track underneath it. Nobody was finding that by staring at the carousel code. It looked fine. It was fine, mostly.

Where it falls down, and I mean this as a flat statement, not a complaint: it will confidently fix the wrong root cause if you don't force a reproduction first. It drifts outside the design system the second a rule gets fuzzy instead of explicit. It loses the thread on anything long without something external reminding it what already happened. All three are process failures, not model failures.

## The ERP integration: the part nobody warns you about

This ate more hours than everything else combined, and it's the part that matters most if you're wiring any ERP or POS system into an ecommerce platform over an XML feed, not just this stack.

The sync runs on CommerceML: the ERP exports packets on a schedule and on events, a plugin on the WordPress side parses them, catalog updates. Simple as a diagram. The traps are all in the details, and since CommerceML is a Russian national standard, the XML element names in the snippet below are genuinely Russian words. Not obfuscation, just the protocol.

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

Two more surfaced close together. Product properties and variation characteristics turned out to be handled as two unrelated mechanisms in this protocol, separate code paths entirely, so a color set up as a property and a size set up as a characteristic land in WooCommerce through completely different logic. And the fast sync sends delta chunks instead of the full catalog on every run, which sounds efficient right up until you notice the plugin was rebuilding each product's entire variation set from whatever chunk it received, meaning any variation missing from that one chunk just vanished. The size range was draining out from under us for I don't know how long before anyone noticed, probably the client before me, honestly. Fixed with a mode that preserves variations across partial exports, plus a cleanup pass, since roughly a thousand orphaned variations had piled up in the database by the time we caught it.

Last one, smaller: attribute terms were getting created with GUID slugs instead of readable ones, which broke filter URLs and made the admin panel borderline unreadable. Mapping table, repair script that runs after every sync, done.

Honest takeaway: an ERP-to-WordPress sync can run reliably in production. Ours does, real time. But "install the plugin and walk away" was never on the table. Budget the time to read the plugin's source, patch its parser, and write your own verification scripts, because the vendor's tests, if they exist, aren't testing for your data.

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

The client sent two full rounds of revisions, about thirty items between them, everything from typography tweaks to restructuring entire blocks. Each round cleared in a few days, not weeks. Total build time landed in weeks, not months.

And the budget number holds up: zero dollars in platform licenses. WordPress, WooCommerce, the rest of the stack, all open source. The client's money went to actual work and hosting instead of a renewal invoice for a boxed platform.

## When this fits, and when it doesn't

Fits a small or mid-size store: custom design, an ERP that isn't a deep enterprise system, a budget that actually constrains the platform choice, and a developer willing to read exchange XML instead of just clicking through a plugin's settings screen.

Doesn't fit a high-volume marketplace pushing thousands of orders a day. Doesn't fit real-time multi-warehouse reservation logic. Doesn't fit a client whose procurement process demands vendor support contracts on paper.

On the AI part specifically: Claude Code didn't replace a developer here. It replaced part of a team. I wouldn't have shipped something this size alone, on this timeline, without it, or I'd have shipped it on a completely different budget, one of those two. But hand the same agent a project with no rules file, no memory between sessions, and no requirement to verify its own claims, and it will produce code that's confident and wrong in roughly equal measure. Building that process around it mattered more than any prompt I ever wrote.

---

That's the first one. I build web stores and internal tools this way pretty regularly, usually pairing solo development with AI agents to hit budgets a full team can't match. More of this at [butakov.dev](https://butakov.dev) if you want it, and happy to answer questions about the ERP side or the Claude Code setup in the comments.

<!--
DEV.TO SETTINGS (not part of the post, strip before pasting)

Frontmatter above already has: title, published: true, description, tags (4/4 used: showdev, ai, wordpress, webdev), canonical_url, cover_image (empty, needs a real URL or upload through the dev.to editor after pasting, dev.to doesn't accept a bare local path in frontmatter).

Why canonical_url is set: this is a rewrite of a case already live at https://butakov.dev/en/journal/wordpress-claude-code-1c. Unlike HackerNoon (no clean field for this, had to argue for "First Seen At"), dev.to has canonical_url specifically for cross-posting your own content, no ambiguity, no plagiarism risk. Keep it pointed at the EN case page.

Why "showdev" is in the tags: it's dev.to's dedicated tag for "I built a real thing, here's how" posts, matches this piece exactly, and it's a smaller/friendlier feed than the huge generic tags, better odds of actually being seen on a first post with zero followers.

No editorial review on dev.to, unlike HackerNoon: this goes live the moment you hit publish (or stays a draft if published: false). No Pangram-style AI check, no 3-day wait. Community moderation is post-publish and complaint-driven, not a submission gate.

Self-promo: dev.to's community norms are looser than HackerNoon's here, a one-line "I do this professionally, here's my site" close is completely normal on this platform. Kept it short anyway since it's your first post and the piece should land on the case, not the pitch.
-->
