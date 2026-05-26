# OpenClaw Ceramic

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — a lexical (keyword-based) search engine that is 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

There are two ways to integrate Ceramic search into OpenClaw: a **plugin** and a **skill**. The plugin is recommended — it registers `ceramic_search` as a native agent tool, handles rewriting natural language queries into keyword queries internally via an LLM call, and runs searches in parallel with deduplication. This produces more consistent and higher-quality results than the prompt-based skill approach. 

The skill is simpler in that the instructions for query rewriting are included in the skill description, and there is no additional LLM call. The skill may also be easier to customize.

## API key

Obtain your API key from the [Ceramic platform page](https://platform.ceramic.ai/keys) and set your API key:

```bash
openclaw config set plugins.entries.ceramic-search.config.apiKey your_api_key_here
```

## Setup

### 1. Installation

To install the plugin, run: 

```bash
openclaw plugins install clawhub:@ceramicai/openclaw-ceramic-search
```

To install the skill instead, run:
```bash
openclaw skills install ceramic-search
```

### 2. Allow the plugin and expose the tool

If using the plugin, do:

```bash
openclaw config set plugins.allow '["ceramic-search"]' --strict-json
openclaw config set tools.alsoAllow '["ceramic_search"]' --strict-json
```

### 3. Modify TOOLS.md

Add the following to `~/.openclaw/workspace/TOOLS.md` (create the file if it doesn't exist) to ensure Ceramic search gets used:

```markdown
## Web Search

Always use the `ceramic_search` tool for web searches. Do not use built-in model web search or any other search tool.
```

Replace "`ceramic_search` tool" with "`ceramic-search` skill" if using the skill instead of the plugin.

### 4. Disable competing web search tools

```bash
openclaw config set tools.deny '["web_search"]' --strict-json
```

This prevents the agent from using the built-in model search and forces it to use Ceramic search instead.

### 5. Restart the gateway

```bash
openclaw gateway restart
```

### 6. Test it

```bash
openclaw agent --agent main --message "What are the top AI news stories right now?"
```

A successful run will show the agent invoking `ceramic_search` with a keyword query and returning a cited answer.
