# Ceramic Search

Web search tool for AI agents, powered by [Ceramic](https://ceramic.ai) — 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

## Installation

```bash
openclaw plugins install clawhub:@ceramicai/openclaw-ceramic-search
```

## Configuration

Get a free API key at [platform.ceramic.ai/keys](https://platform.ceramic.ai/keys) and export it as an environment variable:

```bash
export CERAMIC_API_KEY=your_api_key_here
```

Then allow the plugin and expose the tool:

```bash
openclaw config set plugins.allow '["ceramic-search"]' --strict-json
openclaw config set tools.alsoAllow '["ceramic_search"]' --strict-json
```

To make `ceramic_search` the default search tool, add the following to `~/.openclaw/workspace/TOOLS.md` (create the file if it doesn't exist):

```markdown
## Web Search

Always use the `ceramic_search` tool for web searches. Do not use built-in model web search or any other search tool.
```

Then restart the gateway:

```bash
openclaw gateway restart
```

## Tool Information

The `ceramic_search` tool accepts a natural language query and handles the rest:

1. **Query rewriting** — an internal LLM call converts the natural language query into 1–3 optimised keyword queries for Ceramic's lexical search engine.
2. **Parallel search** — all keyword queries are run in parallel against the Ceramic Search API.
3. **Deduplication** — results are merged and deduplicated by URL.

## Testing

```bash
openclaw agent --agent main --message "What are the top AI news stories right now?"
```

A successful run will show the agent invoking `ceramic_search` with a keyword query and returning a cited answer.
