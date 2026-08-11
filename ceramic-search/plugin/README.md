# Ceramic Search

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

This plugin registers Ceramic as a native `tools.web.search.provider` option (`ceramic`), so it becomes the implementation behind OpenClaw's own `web_search` tool. Under the hood, it rewrites natural language queries into optimized keyword queries using an internal LLM call, runs the resulting keyword queries in parallel against Ceramic's MCP server (`mcp.ceramic.ai`), and deduplicates results by URL.

**1. Install the plugin:**
```bash
openclaw plugins install clawhub:@ceramicai/openclaw-ceramic-search
```

**2. Set your API key:**
Get a Ceramic API key for free at [platform.ceramic.ai/keys](https://platform.ceramic.ai/keys) and set it:
```bash
openclaw config set plugins.entries.ceramic-search.config.apiKey your_api_key_here
```

**3. Allow the plugin and select the provider:**
```bash
openclaw config set plugins.allow '["ceramic-search"]' --strict-json
openclaw config set tools.web.search.provider ceramic
```

**4. Restart the gateway:**
```bash
openclaw gateway restart
```

**5. Test it:**
```bash
openclaw agent --agent main --message "What are the top AI news stories right now?"
```

A successful run will show the agent invoking `web_search` and returning a cited answer sourced from Ceramic.

## How it works

1. **Query rewriting** — an internal LLM call converts the natural language query into 1–3 optimised keyword queries for Ceramic's lexical search engine.
2. **Parallel search** — all keyword queries are run in parallel against Ceramic's MCP server.
3. **Deduplication** — results are merged and deduplicated by URL.
