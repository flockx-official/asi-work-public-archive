# ASI:Work

**ASI:Work** is a custom distribution of [goose](https://github.com/aaif-goose/goose), preconfigured for [ASI:One](https://asi1.ai) models (`asi1`, `asi1-ultra`, `asi1-mini`). It is published by ASI:One as a desktop agent harness for developers and everyday work.

This distribution is not affiliated with or endorsed by the goose project or the Agentic AI Foundation. See [NOTICE.md](NOTICE.md) for the Apache-2.0 attribution and modification notice, and [CUSTOM_DISTROS.md](CUSTOM_DISTROS.md) for upstream's custom-distribution guide.

## Distribution-specific files

Upstream is merged monthly (merge-only, never rebase). All ASI:Work customizations live in:

| File | Change |
| ---- | ------ |
| `crates/goose-providers/src/declarative/definitions/asi_one.json` | Bundled ASI:One provider (added) |
| `crates/goose-providers/src/declarative.rs` | Register `asi_one` in `expose_declarative_providers!` |
| `crates/goose/src/prompts/system.md` | Agent identity |
| `init-config.yaml` | First-run provider/model defaults (added) |
| `ui/desktop/package.json`, `ui/desktop/index.html` | Product name and window title |
| `ui/desktop/src/main.ts` | Bundled defaults in the `env-macro` block |
| `ui/desktop/src/acp/providers.ts` | Restrict provider/template pickers to ASI:One |
| `ui/desktop/src/app-update.yml` | Auto-updater points at this fork |
| `ui/desktop/scripts/verify-mac-update-resources.js` | Updater verification for this fork |
| `ui/desktop/forge.config.ts`, `forge.deb.desktop`, `forge.rpm.desktop` | Packaging identity |
| `NOTICE.md` | Apache-2.0 modification notice (added) |

Desktop app icons are pending design assets and still ship the upstream goose icon.

---

<div align="center">

# goose

_your native open source AI agent — desktop app, CLI, and API — for code, workflows, and everything in between_

<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"
    ><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg"></a>
  <a href="https://discord.gg/n8R5VaWDAn"
    ><img src="https://img.shields.io/discord/1287729918100246654?logo=discord&logoColor=white&label=Join+Us&color=blueviolet" alt="Discord"></a>
  <a href="https://github.com/aaif-goose/goose/actions/workflows/ci.yml"
     ><img src="https://img.shields.io/github/actions/workflow/status/aaif-goose/goose/ci.yml?branch=main" alt="CI"></a>
  <a href="https://insights.linuxfoundation.org/project/goose"><img src="https://insights.linuxfoundation.org/api/badge/health-score?project=goose"></a>
  <a href="https://repology.org/project/goose-cli/versions"><img src="https://repology.org/badge/tiny-repos/goose-cli.svg" alt="Packaging status"></a>
</p>

<a href="https://trendshift.io/repositories/25298?utm_source=repository-badge&amp;utm_medium=badge&amp;utm_campaign=badge-repository-25298" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/repositories/25298" alt="aaif-goose%2Fgoose | Trendshift" width="250" height="55"/></a>

</div>


goose is a general-purpose AI agent that runs on your machine. Not just for code — use it for research, writing, automation, data analysis, or anything you need to get done.

A native desktop app for macOS, Linux, and Windows. A full CLI for terminal workflows. An API to embed it anywhere. Built in Rust for performance and portability.

goose works with 15+ providers — Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock, and more. Use API keys or your existing Claude, ChatGPT, or Gemini subscriptions via [ACP](https://goose-docs.ai/docs/guides/acp-providers). Connect to 70+ extensions via the [Model Context Protocol](https://modelcontextprotocol.io/) open standard.

goose is part of the [Agentic AI Foundation (AAIF)](https://aaif.io/) at the Linux Foundation.

# Get started

**[Download the desktop app](https://goose-docs.ai/docs/getting-started/installation)** for macOS, Linux, and Windows.

Or install the CLI:

```bash
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
```

# Quick links
- [Quickstart](https://goose-docs.ai/docs/quickstart)
- [Installation](https://goose-docs.ai/docs/getting-started/installation)
- [Tutorials](https://goose-docs.ai/docs/category/tutorials)
- [Documentation](https://goose-docs.ai/docs/category/getting-started)
- [Governance](https://github.com/aaif-goose/goose/blob/main/GOVERNANCE.md)
- [Custom Distributions](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md) — build your own goose distro with preconfigured providers, extensions, and branding

## Need help?
- [Diagnostics & Reporting](https://goose-docs.ai/docs/troubleshooting/diagnostics-and-reporting)
- [Known Issues](https://goose-docs.ai/docs/troubleshooting/known-issues)

# a little goose humor 🪿

> Why did the developer choose goose as their AI agent?
> 
> Because it always helps them "migrate" their code to production! 🚀

# goose around with us
- [Discord](https://discord.gg/n8R5VaWDAn)
- [YouTube](https://www.youtube.com/@goose-oss)
- [LinkedIn](https://www.linkedin.com/company/goose-oss)
- [Twitter/X](https://x.com/goose_oss)
