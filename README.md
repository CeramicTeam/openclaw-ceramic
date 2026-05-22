# OpenClaw Ceramic

Web-scale search for your OpenClaw agent, powered by [Ceramic](https://www.ceramic.ai) — 100x cheaper and 10x faster than standard search APIs, with a 40B+ page index.

## Setup
**1. Install the Ceramic Search skill:**
```bash
openclaw skills install ceramic-search
```

**2. Set your API key:**
Get a Ceramic API key for free at [platform.ceramic.ai/keys](https://platform.ceramic.ai/keys) and export it:
```bash
export CERAMIC_API_KEY=your_api_key_here
```

To persist it across sessions, add the line above to your `~/.zshrc`, `~/.bashrc`, or equivalent.

**3. Restart the gateway or start a new session:**                                                                           
                                                                                                                        
```bash                                                                                                                      
openclaw gateway restart                                                               
```    
                                                                                                        
You can verify installation with:                                                                                            
                                                                                                                        
```bash                                                                                                                      
openclaw skills list                                                                                                         
```    

## Usage

Once installed and visible in a new session, the skill instructs the agent to use Ceramic whenever it needs current or external web context. You can also ask explicitly:
- "Search for the latest news on X"
- "Look up the current price of Y"
- "Find recent research on Z"