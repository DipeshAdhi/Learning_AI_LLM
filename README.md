# Contextbook

A free, open textbook for practical AI engineering — teaching developers to use language
models as stateful systems rather than stateless query boxes.

**Live site:** https://dipeshadhi.github.io/Learning_AI_LLM/

Most guides stop at phrasing a better prompt. The harder and more valuable discipline is
deciding what the model sees, what it remembers between sessions, and what gets dropped
first when the context window fills. That is what this book is about.

## What's here

The curriculum runs in four phases, beginner to expert:

| Phase | Page | Covers |
|-------|------|--------|
| 1 · The basics | [`phase-1.html`](phase-1.html) | What an LLM actually does, vibe coding, app builders vs code editors, the golden rule of prompting |
| 2 · Intermediate | [`phase-2.html`](phase-2.html) | Why AI forgets, the memory bank pattern, context compression, summarize & save |
| 3 · Advanced | [`phase-3.html`](phase-3.html) | Large vs small models, prompt caching, hybrid RAG, cost at scale |
| 4 · Expert | [`phase-4.html`](phase-4.html) | Agents, progressive disclosure, `.skill` files, tool calling, MCP, the complete loop |

Plus:

- [`index.html`](index.html) — landing page, with an interactive context-window demo comparing
  a monolithic prompt against progressive disclosure
- [`Not_just_chat_bot.html`](Not_just_chat_bot.html) — "Beyond the Chatbox", five interactive
  modules on skills, memory, economics, compression, and the agent lifecycle
- [`resources.html`](resources.html) — curated documentation and repositories, each labelled by
  how much it can be trusted
- [`skill collection/`](skill%20collection/) — hand-written agent skills used as worked examples

See [SUMMARY.md](SUMMARY.md) for a full section-by-section index.

## Running it locally

No build step, no dependencies, no npm. The site is plain HTML, Tailwind via CDN, and
hand-written JavaScript — open a file and edit it.

Because the pages load CSS and JS from `assets/`, opening them directly with `file://` will
not work. Serve the folder over HTTP instead:

```bash
python3 .claude/serve.py
```

Then visit http://localhost:4321. The server sends `Cache-Control: no-store`, so a plain
reload always shows your latest edit.

## Structure

```
index.html              landing page
phase-1..4.html         the curriculum
resources.html          reading list
Not_just_chat_bot.html  interactive modules
assets/
  css/site.css          all custom styling; Tailwind handles utilities
  js/context-window.js  the homepage token-budget demo
  js/nav.js             mobile navigation
  js/toc.js             table-of-contents scroll spy
skill collection/       agent skills, used as teaching examples
.github/workflows/      GitHub Pages deployment
```

Styling convention: component classes live in `site.css`, layout utilities stay in the markup.
Keeping them separate stops the two fighting over the same property.

## Deployment

Pushing to `main` triggers `.github/workflows/static.yml`, which publishes the whole repository
to GitHub Pages. There is no build step, so what you commit is what ships.

If a change looks missing on the live site, it is almost always browser cache rather than a
failed deploy — hard reload before investigating anything else.

## On sources

This field moves faster than one person can verify, so every claim here is meant to carry its
provenance. Official documentation, peer-reviewed research, and a company describing its own
product are three different kinds of evidence and are not printed as though they were the same.

Two deliberate rules:

- **Model names, not version numbers.** Versions date within months, and a stale one on a
  teaching page undermines everything around it.
- **Figures are labelled.** Where numbers are modelled rather than measured, the page says so.

Found a wrong number? [Open an issue](https://github.com/DipeshAdhi/Learning_AI_LLM/issues/new).
Corrections are the most useful contribution here.

## Status

Draft, written in the open. Phase 1 and Phase 2 have full content; Phases 3 and 4 are written
but still being expanded. Everything is free, permanently, with no signup.
