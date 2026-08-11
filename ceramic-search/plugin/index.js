import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const CERAMIC_MCP_URL = "https://mcp.ceramic.ai/mcp";
const CERAMIC_MCP_TOOL_NAME = "ceramic_search";

const S = (s) => s;
const PARAMS_SCHEMA = S({
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Natural language search query from the user or agent."
    },
    maxDescriptionLength: {
      type: "number",
      description: "Max characters per result description (1000–8000). Defaults to 3000.",
      minimum: 1e3,
      maximum: 8e3
    }
  },
  required: ["query"]
});

const QUERY_REWRITE_SYSTEM_PROMPT = [
  "Rewrite the user's natural language query into 1–3 keyword-based search queries for Ceramic's lexical search engine.",
  "Ceramic matches exact keywords — it does not interpret natural language or synonyms automatically.",
  "",
  "Rules:",
  "- Queries must be 2-8 words.",
  "- Extract specific entities, topics, locations, and dates.",
  "- Replace conversational phrasing with concrete keywords.",
  "- Do not include uninformative words such as articles (the, a, an). Avoid prepositions (on, about, in, for, of, at, by, with) unless they are within established phrases or names (United States of America, Into the Wild).",
  "- Include relevant synonyms explicitly when terminology is ambiguous.",
  "- Keep word order meaningful (`house cat` and `cat house` return different results).",
  "",
  "Good keyword query examples:",
  '- "2026 Super Bowl halftime performer"',
  '- "climate change effects global warming impact"',
  '- "beginner investing strategies stocks bonds basics"',
  "",
  "Return ONLY a JSON array of strings with no markdown or explanation.",
  'Example: ["large language model news 2025", "LLM benchmarks latest research"]'
].join("\n");

async function rewriteToKeywordQueries(api, query) {
  try {
    const llmResult = await api.runtime.llm.complete({
      purpose: "ceramic_search: query rewrite",
      systemPrompt: QUERY_REWRITE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
      maxTokens: 200,
      temperature: 0
    });
    const parsed = JSON.parse(llmResult.text.trim());
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((q) => typeof q === "string")) {
      return { keywordQueries: parsed.slice(0, 3) };
    }
    throw new Error("unexpected shape");
  } catch (err) {
    return { keywordQueries: [query], rewriteError: err instanceof Error ? err.message : String(err) };
  }
}

function mergeResultsByUrl(perQueryResults) {
  const seen = new Set();
  const merged = [];
  for (const results of perQueryResults) {
    for (const item of results) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        merged.push(item);
      }
    }
  }
  return merged;
}

function resolveApiKey(config) {
  return config?.apiKey ?? process.env.CERAMIC_API_KEY ?? "";
}

// Cache MCP clients per API key so repeated searches reuse one connection.
const mcpClientsByApiKey = new Map();

function getCeramicMcpClient(apiKey) {
  let clientPromise = mcpClientsByApiKey.get(apiKey);
  if (!clientPromise) {
    clientPromise = (async () => {
      const transport = new StreamableHTTPClientTransport(new URL(CERAMIC_MCP_URL), {
        requestInit: { headers: { Authorization: `Bearer ${apiKey}` } }
      });
      const client = new Client({ name: "openclaw-ceramic-search", version: "2.0.0" }, { capabilities: {} });
      await client.connect(transport);
      return client;
    })();
    clientPromise.catch(() => mcpClientsByApiKey.delete(apiKey));
    mcpClientsByApiKey.set(apiKey, clientPromise);
  }
  return clientPromise;
}

// Ceramic's MCP tool response is its own shape, not the REST API's
// `{ requestId, result: { results } }` envelope: it's
// `{ success, summary, results: [{ rank, title, url, description }] }` on
// success, or `{ success: false, error, status, code, requestId }` on
// failure (verified against the live mcp.ceramic.ai server).
async function searchOneQueryViaMcp(apiKey, query, maxDescriptionLength, signal) {
  const client = await getCeramicMcpClient(apiKey);
  const result = await client.callTool(
    { name: CERAMIC_MCP_TOOL_NAME, arguments: { query, maxDescriptionLength } },
    void 0,
    { signal }
  );
  const textBlock = result.content?.find((block) => block.type === "text");
  const parsed = textBlock ? JSON.parse(textBlock.text) : null;
  if (result.isError || !parsed || parsed.success === false) {
    const message = parsed?.error ?? "Ceramic MCP search failed";
    throw new Error(`Ceramic MCP error for query "${query}": ${message}`);
  }
  return parsed.results ?? [];
}

var index_default = definePluginEntry({
  id: "ceramic-search",
  name: "Ceramic Search",
  description: "Web search for AI agents.",
  register(api) {
    api.registerWebSearchProvider({
      id: "ceramic",
      label: "Ceramic Search",
      hint: "Lexical web search across a 40B+ page index, via Ceramic's MCP server.",
      envVars: ["CERAMIC_API_KEY"],
      placeholder: "cer_sk_...",
      signupUrl: "https://platform.ceramic.ai/keys",
      docsUrl: "https://ceramic.ai",
      credentialPath: "plugins.entries.ceramic-search.config.apiKey",
      getCredentialValue: (config) => config?.apiKey,
      setCredentialValue: (configTarget, value) => {
        configTarget.apiKey = value;
      },
      createTool(ctx) {
        return {
          description: [
            "Search the web using Ceramic.",
            "Use for accurate current information — news, prices, recent events, documentation, general fact checking.",
            "Returns up to 10 ranked results with titles, URLs, and descriptions."
          ].join(" "),
          parameters: PARAMS_SCHEMA,
          async execute(rawParams, execCtx) {
            const params = rawParams;
            const apiKey = resolveApiKey(ctx.searchConfig);
            if (!apiKey) {
              return {
                error: "missing_api_key",
                message: "Ceramic API key is not configured. Set plugins.entries.ceramic-search.config.apiKey or CERAMIC_API_KEY."
              };
            }
            const { keywordQueries, rewriteError } = await rewriteToKeywordQueries(api, params.query);
            const maxDescriptionLength = params.maxDescriptionLength ?? 3e3;
            try {
              const perQueryResults = await Promise.all(
                keywordQueries.map((kq) => searchOneQueryViaMcp(apiKey, kq, maxDescriptionLength, execCtx?.signal))
              );
              const merged = mergeResultsByUrl(perQueryResults);
              return {
                results: merged.map((r) => ({ title: r.title, url: r.url, description: r.description })),
                count: merged.length,
                ...rewriteError ? { rewriteError } : {}
              };
            } catch (err) {
              return {
                error: "ceramic_search_failed",
                message: err instanceof Error ? err.message : String(err)
              };
            }
          }
        };
      }
    });
  }
});
export {
  index_default as default
};
