# OpenClaw Ceramic

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — a lexical (keyword-based) search engine that is 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

Ceramic integrates into OpenClaw as a **native web search provider**: installing the plugin registers Ceramic as a `tools.web.search.provider` option, so it becomes the implementation behind OpenClaw's own `web_search` tool. It calls Ceramic's MCP server directly (API-key auth, no OAuth).

## Setup

```bash
openclaw plugins install clawhub:@ceramicai/openclaw-ceramic-search
openclaw config set plugins.allow '["ceramic-search"]' --strict-json
openclaw config set plugins.entries.ceramic-search.config.apiKey your_api_key_here
openclaw config set tools.web.search.provider ceramic
openclaw gateway restart
openclaw agent --agent main --message "What are the top AI news stories right now?"
```

Get your API key from the [Ceramic platform page](https://platform.ceramic.ai/keys). `CERAMIC_API_KEY` in the environment also works as a fallback if you'd rather not store it in config.

A successful run will show Ceramic search results via citations in the agent response.
