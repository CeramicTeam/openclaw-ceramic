# OpenClaw Ceramic

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

## Installation

**1. Install the skill:**
```bash
openclaw skills install ceramic-search
```

**2. Set your API key:**
Get a Ceramic API key for free at [platform.ceramic.ai/keys](https://platform.ceramic.ai/keys) and export it:
```bash
export CERAMIC_API_KEY=your_api_key_here
```

To persist it across sessions, add the line above to your `~/.zshrc`, `~/.bashrc`, or equivalent.

**3. Restart the gateway:**
```bash
openclaw gateway restart
```

## Usage

Once installed, your agent will use Ceramic automatically whenever it needs to search the web. You can also ask explicitly:

> "Search for the latest news on X"
> "Look up the current price of Y"
> "Find recent research on Z"

## Pricing

See [ceramic.ai/pricing](https://www.ceramic.ai/pricing) for details.

## Troubleshooting

**Auth errors:** Check that `CERAMIC_API_KEY` is set correctly in your environment (`echo $CERAMIC_API_KEY`), then run `openclaw gateway restart`.

**Skill not found:** Run `openclaw skills list` to confirm the skill installed, then restart the gateway.