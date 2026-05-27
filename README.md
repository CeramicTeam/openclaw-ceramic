# OpenClaw Ceramic

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — a lexical (keyword-based) search engine that is 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

There are two ways to integrate Ceramic search into OpenClaw: a **plugin** and a **skill**. The plugin is recommended — it registers `ceramic_search` as a native agent tool, handles rewriting natural language queries into keyword queries internally via an LLM call, and runs searches in parallel with deduplication. This produces more consistent and higher-quality results than the prompt-based skill approach. OpenClaw agents also generally remember to call Ceramic search more with the plugin, as skills are merely system prompt-level suggestions that agents aren't required to follow.

The skill is simpler in that the instructions for query rewriting are included in the skill description, and there is no additional LLM call. The skill may also be easier to customize.

## Setup

### 1. API key

Obtain your API key from the [Ceramic platform page](https://platform.ceramic.ai/keys) and export it:
```bash
export CERAMIC_API_KEY=your_api_key_here
```

To persist it across sessions, add the line above to your `~/.zshrc`, `~/.bashrc`, or equivalent.

If using the plugin, you can also do:
```bash
openclaw config set plugins.entries.ceramic-search.config.apiKey your_api_key_here
```

### 2. Installation

To install the plugin, run: 

```bash
openclaw plugins install clawhub:@ceramicai/openclaw-ceramic-search
```

To install the skill instead, run:
```bash
openclaw skills install ceramic-search
```

### 3. Allow the plugin and expose the tool

If using the plugin, do:

```bash
openclaw config set plugins.allow '["ceramic-search"]' --strict-json
openclaw config set tools.alsoAllow '["ceramic_search"]' --strict-json
```

### 4. Modify TOOLS.md

Add the following to `~/.openclaw/workspace/TOOLS.md` (create the file if it doesn't exist) to ensure Ceramic search gets used:

```markdown
## Web Search

Always use the `ceramic_search` tool for web searches. Do not use built-in model web search or any other search tool.
```

Replace "`ceramic_search` tool" with "`ceramic-search` skill" if using the skill instead of the plugin.

### 5. Disable competing web search tools

```bash
openclaw config set tools.deny '["web_search"]' --strict-json
```

This prevents the agent from using the built-in model search and forces it to use Ceramic search instead.

### 6. Restart the gateway

```bash
openclaw gateway restart
```

### 7. Test it

```bash
openclaw agent --agent main --message "What are the top AI news stories right now?"
```

A successful run will show the agent invoking Ceramic search with a keyword query and returning a cited answer.
