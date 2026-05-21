---
name: search
description: Search the web using Ceramic and obtain high-quality search results. Use this skill whenever you need current or external context to answer accurately, including when the user asks you to search, when your knowledge may be outdated, or when the task requires facts you cannot reliably recall.
metadata:
  clawdbot:
    requires:
      env:
        - CERAMIC_API_KEY
    primaryEnv: CERAMIC_API_KEY
    envVars:
      - name: CERAMIC_API_KEY
        required: true
        description: Your Ceramic AI API key, available at https://platform.ceramic.ai/keys
    emoji: "🔍"
---

Follow these steps to use Ceramic to search the web and obtain high-quality search results to support your response:

1. **Rewrite the natural language query** for Ceramic's search engine before calling the API. Generate a keyword query of **2–8 words**.
   - Extract specific entities, topics, locations, and dates from the user's request
   - Replace conversational phrasing with concrete keywords
   - Include relevant synonyms explicitly when terminology is ambiguous
   - Keep word order meaningful (`house cat` and `cat house` return different results)
   - Examples of good keyword queries:
     - "2026 Super Bowl halftime performer"
     - "climate change effects global warming impact"
     - "beginner investing strategies stocks bonds basics"

2. **Call the Ceramic Search API** with the rewritten query:

   ```bash
   curl https://api.ceramic.ai/search \
     -H "Authorization: Bearer $CERAMIC_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"query": "YOUR_QUERY_HERE"}'
   ```

3. **Parse the response** from `result.results`. Each result includes `title`, `url`, `description`, and `score`.

4. **Summarize with citations** — write a concise answer drawing from the result descriptions, then list sources as numbered references:

   **Sources**
   1. [Title](url)
   2. [Title](url)

Only cite sources whose descriptions contributed to the answer. If the search returns no useful results, refine the query with more specific keywords and try again before giving up.