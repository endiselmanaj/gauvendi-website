Apps SDK docs

Quickstart:
# Quickstart

## Introduction

The Apps SDK relies on the [Model Context Protocol (MCP)](/apps-sdk/concepts/mcp-server) to expose your app to ChatGPT. To build an app for ChatGPT with the Apps SDK, you will need two things:

1. A web component built with the framework of your choice – you are free to build your app as you see fit, that will be rendered in an iframe in the ChatGPT interface.
2. A Model Context Protocol (MCP) server that will be used to expose your app and define your app's capabilities (tools) to ChatGPT.

In this quickstart, we'll build a simple to-do list app, contained in a single HTML file that keeps the markup, CSS, and JavaScript together.

To see more advanced examples using React, see the [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples).

## Build a web component

Let's start by creating a file called `public/todo-widget.html` in a new directory that will be the UI rendered by the Apps SDK in ChatGPT.
This file will contain the web component that will be rendered in the ChatGPT interface.

Add the following content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Todo list</title>
    <style>
      :root {
        color: #0b0b0f;
        font-family: "Inter", system-ui, -apple-system, sans-serif;
      }

      html,
      body {
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 16px;
        background: #f6f8fb;
      }

      main {
        width: 100%;
        max-width: 360px;
        min-height: 260px;
        margin: 0 auto;
        background: #fff;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
      }

      h2 {
        margin: 0 0 16px;
        font-size: 1.25rem;
      }

      form {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      form input {
        flex: 1;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #cad3e0;
        font-size: 0.95rem;
      }

      form button {
        border: none;
        border-radius: 10px;
        background: #111bf5;
        color: white;
        font-weight: 600;
        padding: 0 16px;
        cursor: pointer;
      }

      input[type="checkbox"] {
        accent-color: #111bf5;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      li {
        background: #f2f4fb;
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      li span {
        flex: 1;
      }

      li[data-completed="true"] span {
        text-decoration: line-through;
        color: #6c768a;
      }
    </style>
  </head>
  <body>
    <main>
      <h2>Todo list</h2>
      <form id="add-form" autocomplete="off">
        <input id="todo-input" name="title" placeholder="Add a task" />
        <button type="submit">Add</button>
      </form>
      <ul id="todo-list"></ul>
    </main>

    <script type="module">
      const listEl = document.querySelector("#todo-list");
      const formEl = document.querySelector("#add-form");
      const inputEl = document.querySelector("#todo-input");

      let tasks = [...(window.openai?.toolOutput?.tasks ?? [])];

      const render = () => {
        listEl.innerHTML = "";
        tasks.forEach((task) => {
          const li = document.createElement("li");
          li.dataset.id = task.id;
          li.dataset.completed = String(Boolean(task.completed));

          const label = document.createElement("label");
          label.style.display = "flex";
          label.style.alignItems = "center";
          label.style.gap = "10px";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = Boolean(task.completed);

          const span = document.createElement("span");
          span.textContent = task.title;

          label.appendChild(checkbox);
          label.appendChild(span);
          li.appendChild(label);
          listEl.appendChild(li);
        });
      };

      const updateFromResponse = (response) => {
        if (response?.structuredContent?.tasks) {
          tasks = response.structuredContent.tasks;
          render();
        }
      };

      const handleSetGlobals = (event) => {
        const globals = event.detail?.globals;
        if (!globals?.toolOutput?.tasks) return;
        tasks = globals.toolOutput.tasks;
        render();
      };

      window.addEventListener("openai:set_globals", handleSetGlobals, {
        passive: true,
      });

      const mutateTasksLocally = (name, payload) => {
        if (name === "add_todo") {
          tasks = [
            ...tasks,
            { id: crypto.randomUUID(), title: payload.title, completed: false },
          ];
        }

        if (name === "complete_todo") {
          tasks = tasks.map((task) =>
            task.id === payload.id ? { ...task, completed: true } : task
          );
        }

        if (name === "set_completed") {
          tasks = tasks.map((task) =>
            task.id === payload.id
              ? { ...task, completed: payload.completed }
              : task
          );
        }

        render();
      };

      const callTodoTool = async (name, payload) => {
        if (window.openai?.callTool) {
          const response = await window.openai.callTool(name, payload);
          updateFromResponse(response);
          return;
        }

        mutateTasksLocally(name, payload);
      };

      formEl.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = inputEl.value.trim();
        if (!title) return;
        await callTodoTool("add_todo", { title });
        inputEl.value = "";
      });

      listEl.addEventListener("change", async (event) => {
        const checkbox = event.target;
        if (!checkbox.matches('input[type="checkbox"]')) return;
        const id = checkbox.closest("li")?.dataset.id;
        if (!id) return;

        if (!checkbox.checked) {
          if (window.openai?.callTool) {
            checkbox.checked = true;
            return;
          }

          mutateTasksLocally("set_completed", { id, completed: false });
          return;
        }

        await callTodoTool("complete_todo", { id });
      });

      render();
    </script>
  </body>
</html>
```

### Using the Apps SDK in your web component

`window.openai` is the bridge between your frontend and ChatGPT.

When ChatGPT loads the iframe, it injects the latest tool response into `window.openai.toolOutput`, which is an object specific to the Apps SDK.
Subsequent calls to `window.openai.callTool` return fresh structured content so the UI stays in sync.

## Build an MCP server

Install the official Python or Node MCP SDK to create a server and expose a `/mcp` endpoint.

In this quickstart, we'll use the [Node SDK](https://github.com/modelcontextprotocol/typescript-sdk).

If you're using Python, refer to our [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples) to see an example MCP server with the Python SDK.

Install the Node SDK and Zod with:

```bash
npm install @modelcontextprotocol/sdk zod
```

### MCP server with Apps SDK resources

Register a resource for your component bundle and the tools the model can call (e.g. `add_todo` and `complete_todo`) so ChatGPT can drive the UI.

Create a file named `server.js` and paste the following example that uses the Node SDK:

```js






const todoHtml = readFileSync("public/todo-widget.html", "utf8");

const addTodoInputSchema = {
  title: z.string().min(1),
};

const completeTodoInputSchema = {
  id: z.string().min(1),
};

let todos = [];
let nextId = 1;

const replyWithTodos = (message) => ({
  content: message ? [{ type: "text", text: message }] : [],
  structuredContent: { tasks: todos },
});

function createTodoServer() {
  const server = new McpServer({ name: "todo-app", version: "0.1.0" });

  server.registerResource(
    "todo-widget",
    "ui://widget/todo.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/todo.html",
          mimeType: "text/html+skybridge",
          text: todoHtml,
          _meta: { "openai/widgetPrefersBorder": true },
        },
      ],
    })
  );

  server.registerTool(
    "add_todo",
    {
      title: "Add todo",
      description: "Creates a todo item with the given title.",
      inputSchema: addTodoInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/todo.html",
        "openai/toolInvocation/invoking": "Adding todo",
        "openai/toolInvocation/invoked": "Added todo",
      },
    },
    async (args) => {
      const title = args?.title?.trim?.() ?? "";
      if (!title) return replyWithTodos("Missing title.");
      const todo = { id: `todo-${nextId++}`, title, completed: false };
      todos = [...todos, todo];
      return replyWithTodos(`Added "${todo.title}".`);
    }
  );

  server.registerTool(
    "complete_todo",
    {
      title: "Complete todo",
      description: "Marks a todo as done by id.",
      inputSchema: completeTodoInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/todo.html",
        "openai/toolInvocation/invoking": "Completing todo",
        "openai/toolInvocation/invoked": "Completed todo",
      },
    },
    async (args) => {
      const id = args?.id;
      if (!id) return replyWithTodos("Missing todo id.");
      const todo = todos.find((task) => task.id === id);
      if (!todo) {
        return replyWithTodos(`Todo ${id} was not found.`);
      }

      todos = todos.map((task) =>
        task.id === id ? { ...task, completed: true } : task
      );

      return replyWithTodos(`Completed "${todo.title}".`);
    }
  );

  return server;
}

const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end("Todo MCP server");
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    const server = createTodoServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(
    `Todo MCP server listening on http://localhost:${port}${MCP_PATH}`
  );
});
```

This snippet also responds to `GET /` for health checks, handles CORS preflight for `/mcp` and nested routes like `/mcp/actions`, and returns `404 Not Found` for OAuth discovery routes you are not using yet. That keeps ChatGPT’s connector wizard from surfacing 502 errors while you iterate without authentication.

## Run locally

If you're using a web framework like React, build your component into static assets so the HTML template can inline them.
Usually, you can run a build command such as `npm run build` to produce a `dist` directory with your compiled assets.

In this quickstart, since we're using vanilla HTML, no build step is required.

Start the MCP server on `http://localhost:<port>/mcp` from the directory that contains `server.js` (or `server.ts`).

Make sure you have `"type": "module"` in your `package.json` file:

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "zod": "^3.25.76"
  }
}
```

Then run the server with the following command:

```bash
node server.js
```

The server should print `Todo MCP server listening on http://localhost:8787/mcp` once it is ready.

### Test with MCP Inspector

You can use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to test your server locally.

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

This will open a browser window with the MCP Inspector interface. You can use this to test your server and see the tool responses.

![MCP Inspector](/images/apps-sdk/mcp_inspector.png)

### Expose your server to the public internet

For ChatGPT to access your server during development, you need to expose it to the public internet. You can use a tool such as [ngrok](https://ngrok.com/) to open a tunnel to your local server.

```bash
ngrok http <port>
```

This will give you a public URL like `https://<subdomain>.ngrok.app` that you can use to access your server from ChatGPT.

When you add you connector, provide the public URL with the `/mcp` path (e.g. `https://<subdomain>.ngrok.app/mcp`).

## Add your app to ChatGPT

Once you have your MCP server and web component working locally, you can add your app to ChatGPT with the following steps:

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode) under **Settings → Apps & Connectors → Advanced settings** in ChatGPT.
2. Click the **Create** button to add a connector under **Settings → Connectors** and paste the HTTPS + `/mcp` URL from your tunnel or deployment (e.g. `https://<subdomain>.ngrok.app/mcp`).
3. Name the connector, provide a short description and click **Create**.

<div style={{ width: "50%", margin: "0 auto", display: "block" }}>
  <img
    src="/images/apps-sdk/new_connector.jpg"
    alt="Add your connector to ChatGPT"
  />
</div>

4. Open a new chat, add your connector from the **More** menu (accessible after clicking the **+** button), and prompt the model (e.g., “Add a new task to read my book”). ChatGPT will stream tool payloads so you can confirm inputs and outputs.

![Add your connector to a conversation](/images/apps-sdk/developer_mode_more.jpg)

## Next steps

From there, you can iterate on the UI/UX, prompts, tool metadata, and the overall experience.



Refresh the connector after each change to the MCP server (tools, metadata,
  etc.) You can do this by clicking the **Refresh** button in **Settings →
  Connectors** after selecting your connector.



Read our [app developer guidelines](/apps-sdk/app-developer-guidelines) to learn more about the best practices for building apps for ChatGPT, and make sure you [research your use case](/apps-sdk/plan/use-case) and [read our design guidelines](/apps-sdk/concepts/design-guidelines) before building.

Once you understand the basics, you can leverage the Apps SDK to [build a custom UX](/apps-sdk/build/custom-ux) using the Apps SDK primitives, [authenticate users](/apps-sdk/build/auth) if needed, and [persist state](/apps-sdk/build/storage).

MCP server:
# MCP

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open specification for connecting large language model clients to external tools and resources. An MCP server exposes **tools** that a model can call during a conversation, and return results given specified parameters.
Other resources (metadata) can be returned along with tool results, including the inline html that we can use in the Apps SDK to render an interface.

With Apps SDK, MCP is the backbone that keeps server, model, and UI in sync. By standardising the wire format, authentication, and metadata, it lets ChatGPT reason about your app the same way it reasons about built-in tools.

## Protocol building blocks

A minimal MCP server for Apps SDK implements three capabilities:

1. **List tools** – your server advertises the tools it supports, including their JSON Schema input and output contracts and optional annotations.
2. **Call tools** – when a model selects a tool to use, it sends a `call_tool` request with the arguments corresponding to the user intent. Your server executes the action and returns structured content the model can parse.
3. **Return components** – in addition to structured content returned by the tool, each tool (in its metadata) can optionally point to an [embedded resource](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#embedded-resources) that represents the interface to render in the ChatGPT client.

The protocol is transport agnostic, you can host the server over Server-Sent Events or Streamable HTTP. Apps SDK supports both options, but we recommend Streamable HTTP.

## Why Apps SDK standardises on MCP

Working through MCP gives you several benefits out of the box:

- **Discovery integration** – the model consumes your tool metadata and surface descriptions the same way it does for first-party connectors, enabling natural-language discovery and launcher ranking. See [Discovery](/apps-sdk/concepts/user-interaction) for details.
- **Conversation awareness** – structured content and component state flow through the conversation. The model can inspect the JSON result, refer to IDs in follow-up turns, or render the component again later.
- **Multiclient support** – MCP is self-describing, so your connector works across ChatGPT web and mobile without custom client code.
- **Extensible auth** – the specification includes protected resource metadata, OAuth 2.1 flows, and dynamic client registration so you can control access without inventing a proprietary handshake.

## Next steps

If you're new to MCP, we recommend starting with the following resources:

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- Official SDKs: [Python SDK (official; includes FastMCP module)](https://github.com/modelcontextprotocol/python-sdk) and [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) for local debugging

Once you are comfortable with the MCP primitives, you can move on to the [Set up your server](/apps-sdk/build/mcp-server) guide for implementation details.

User interaction:
# User Interaction

## Discovery

Discovery refers to the different ways a user or the model can find out about your app and the tools it provides: natural-language prompts, directory browsing, and proactive [entry points](#entry-points). Apps SDK leans on your tool metadata and past usage to make intelligent choices. Good discovery hygiene means your app appears when it should and stays quiet when it should not.

### Named mention

When a user mentions the name of your app at the beginning of a prompt, your app will be surfaced automatically in the response. The user must specify your app name at the beginning of their prompt. If they do not, your app can also appear as a suggestion through in-conversation discovery.

### In-conversation discovery

When a user sends a prompt, the model evaluates:

- **Conversation context** – the chat history, including previous tool results, memories, and explicit tool preferences
- **Conversation brand mentions and citations** - whether your brand is explicitly requested in the query or is surfaced as a source/citation in search results.
- **Tool metadata** – the names, descriptions, and parameter documentation you provide in your MCP server.
- **User linking state** – whether the user already granted access to your app, or needs to connect it before the tool can run.

You influence in-conversation discovery by:

1. Writing action-oriented [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool) (“Use this when the user wants to view their kanban board”) rather than generic copy.
2. Writing clear [component descriptions](/apps-sdk/reference#add-component-descriptions) on the resource UI template metadata.
3. Regularly testing your golden prompt set in ChatGPT developer mode and logging precision/recall.

If the assistant selects your tool, it handles arguments, displays confirmation if needed, and renders the component inline. If no linked tool is an obvious match, the model will default to built-in capabilities, so keep evaluating and improving your metadata.

### Directory

The directory will give users a browsable surface to find apps outside of a conversation. Your listing in this directory will include:

- App name and icon
- Short and long descriptions
- Tags or categories (where supported)
- Optional onboarding instructions or screenshots

## Entry points

Once a user links your app, ChatGPT can surface it through several entry points. Understanding each surface helps you design flows that feel native and discoverable.

### In-conversation entry

Linked tools are always on in the model’s context. When the user writes a prompt, the assistant decides whether to call your tool based on the conversation state and metadata you supplied. Best practices:

- Keep tool descriptions action oriented so the model can disambiguate similar apps.
- Return structured content that references stable IDs so follow-up prompts can mutate or summarise prior results.
- Provide `_meta` [hints](/apps-sdk/reference#tool-descriptor-parameters) so the client can streamline confirmation and rendering.

When a call succeeds, the component renders inline and inherits the current theme, composer, and confirmation settings.

### Launcher

The launcher (available from the + button in the composer) is a high-intent entry point where users can explicitly choose an app. Your listing should include a succinct label and icon. Consider:

- **Deep linking** – include starter prompts or entry arguments so the user lands on the most useful tool immediately.
- **Context awareness** – the launcher ranks apps using the current conversation as a signal, so keep metadata aligned with the scenarios you support.

Research use cases:
# Research use cases

## Why start with use cases

Every successful Apps SDK app starts with a crisp understanding of what the user is trying to accomplish. Discovery in ChatGPT is model-driven: the assistant chooses your app when your tool metadata, descriptions, and past usage align with the user’s prompt and memories. That only works if you have already mapped the tasks the model should recognize and the outcomes you can deliver.

Use this page to capture your hypotheses, pressure-test them with prompts, and align your team on scope before you define tools or build components.

## Gather inputs

Begin with qualitative and quantitative research:

- **User interviews and support requests** – capture the jobs-to-be-done, terminology, and data sources users rely on today.
- **Prompt sampling** – list direct asks (e.g., “show my Jira board”) and indirect intents (“what am I blocked on for the launch?”) that should route to your app.
- **System constraints** – note any compliance requirements, offline data, or rate limits that will influence tool design later.

Document the user persona, the context they are in when they reach for ChatGPT, and what success looks like in a single sentence for each scenario.

## Define evaluation prompts

Decision boundary tuning is easier when you have a golden set to iterate against. For each use case:

1. **Author at least five direct prompts** that explicitly reference your data, product name, or verbs you expect the user to say.
2. **Draft five indirect prompts** where the user states a goal but not the tool (“I need to keep our launch tasks organized”).
3. **Add negative prompts** that should *not* trigger your app so you can measure precision.

Use these prompts later in [Optimize metadata](/apps-sdk/guides/optimize-metadata) to hill-climb on recall and precision without overfitting to a single request.

## Scope the minimum lovable feature

For each use case decide:

- **What information must be visible inline** to answer the question or let the user act.
- **Which actions require write access** and whether they should be gated behind confirmation in developer mode.
- **What state needs to persist** between turns—for example, filters, selected rows, or draft content.

Rank the use cases based on user impact and implementation effort. A common pattern is to ship one P0 scenario with a high-confidence component, then expand to P1 scenarios once discovery data confirms engagement.

## Translate use cases into tooling

Once a scenario is in scope, draft the tool contract:

- Inputs: the parameters the model can safely provide. Keep them explicit, use enums when the set is constrained, and document defaults.
- Outputs: the structured content you will return. Add fields the model can reason about (IDs, timestamps, status) in addition to what your UI renders.
- Component intent: whether you need a read-only viewer, an editor, or a multiturn workspace. This influences the [component planning](/apps-sdk/plan/components) and storage model later.

Review these drafts with stakeholders—especially legal or compliance teams—before you invest in implementation. Many integrations require PII reviews or data processing agreements before they can ship to production.

## Prepare for iteration

Even with solid planning, expect to revise prompts and metadata after your first dogfood. Build time into your schedule for:

- Rotating through the golden prompt set weekly and logging tool selection accuracy.
- Collecting qualitative feedback from early testers in ChatGPT developer mode.
- Capturing analytics (tool calls, component interactions) so you can measure adoption.

These research artifacts become the backbone for your roadmap, changelog, and success metrics once the app is live.

Define tools:
# Define tools

## Tool-first thinking

In Apps SDK, tools are the contract between your MCP server and the model. They describe what the connector can do, how to call it, and what data comes back. Good tool design makes discovery accurate, invocation reliable, and downstream UX predictable.

Use the checklist below to turn your use cases into well-scoped tools before you touch the SDK.

## Draft the tool surface area

Start from the user journey defined in your [use case research](/apps-sdk/plan/use-case):

- **One job per tool** – keep each tool focused on a single read or write action ("fetch_board", "create_ticket"), rather than a kitchen-sink endpoint. This helps the model decide between alternatives.
- **Explicit inputs** – define the shape of `inputSchema` now, including parameter names, data types, and enums. Document defaults and nullable fields so the model knows what is optional.
- **Predictable outputs** – enumerate the structured fields you will return, including machine-readable identifiers that the model can reuse in follow-up calls.

If you need both read and write behavior, create separate tools so ChatGPT can respect confirmation flows for write actions.

## Capture metadata for discovery

Discovery is driven almost entirely by metadata. For each tool, draft:

- **Name** – action oriented and unique inside your connector (`kanban.move_task`).
- **Description** – one or two sentences that start with "Use this when…" so the model knows exactly when to pick the tool.
- **Parameter annotations** – describe each argument and call out safe ranges or enumerations. This context prevents malformed calls when the user prompt is ambiguous.
- **Global metadata** – confirm you have app-level name, icon, and descriptions ready for the directory and launcher.

Later, plug these into your MCP server and iterate using the [Optimize metadata](/apps-sdk/guides/optimize-metadata) workflow.

## Model-side guardrails

Think through how the model should behave once a tool is linked:

- **Prelinked vs. link-required** – if your app can work anonymously, mark tools as available without auth. Otherwise, make sure your connector enforces linking via the onboarding flow described in [Authentication](/apps-sdk/build/auth).
- **Read-only hints** – set the [`readOnlyHint` annotation](https://openaidevs-preview-apps-sdk.vercel.app/apps-sdk/reference#tool-descriptor-parameters) for tools that cannot mutate state so ChatGPT can skip confirmation prompts when possible.
- **Result components** – decide whether each tool should render a component, return JSON only, or both. Setting `_meta["openai/outputTemplate"]` on the tool descriptor advertises the HTML template to ChatGPT.

## Golden prompt rehearsal

Before you implement, sanity-check your tool set against the prompt list you captured earlier:

1. For every direct prompt, confirm you have exactly one tool that clearly addresses the request.
2. For indirect prompts, ensure the tool descriptions give the model enough context to select your connector instead of a built-in alternative.
3. For negative prompts, verify your metadata will keep the tool hidden unless the user explicitly opts in (e.g., by naming your product).

Capture any gaps or ambiguities now and adjust the plan—changing metadata before launch is much cheaper than refactoring code later.

## Handoff to implementation

When you are ready to implement, compile the following into a handoff document:

- Tool name, description, input schema, and expected output schema.
- Whether the tool should return a component, and if so which UI component should render it.
- Auth requirements, rate limits, and error handling expectations.
- Test prompts that should succeed (and ones that should fail).

Bring this plan into the [Set up your server](/apps-sdk/build/mcp-server) guide to translate it into code with the MCP SDK of your choice.

Set up server:
# Build your MCP server

By the end of this guide, you’ll know how to connect your backend MCP server to ChatGPT, define tools, register UI templates, and tie everything together using the widget runtime. You’ll build a working foundation for a ChatGPT App that returns structured data, renders an interactive widget, and keeps your model, server, and UI in sync. If you prefer to dive straight into the implementation, you can skip ahead to the [example](#example) at the end.
## Overview 

### What an MCP server does for your app

ChatGPT Apps have three components:

- **Your MCP server** defines tools, enforces auth, returns data, and points each tool to a UI bundle.
- **The widget/UI bundle** renders inside ChatGPT’s iframe, reading data and widget-runtime globals exposed through `window.openai`.
- **The model** decides when to call tools and narrates the experience using the structured data you return.

A solid server implementation keeps those boundaries clean so you can iterate on UI and data independently. Remember: you build the MCP server and define the tools, but ChatGPT’s model chooses when to call them based on the metadata you provide.

### Before you begin

Pre-requisites:

- Comfortable with TypeScript or Python and a web bundler (Vite, esbuild, etc.).
- MCP server reachable over HTTP (local is fine to start).
- Built UI bundle that exports a root script (React or vanilla).

Example project layout:

```
your-chatgpt-app/
├─ server/
│  └─ src/index.ts          # MCP server + tool handlers
├─ web/
│  ├─ src/component.tsx     # React widget
│  └─ dist/app.{js,css}  # Bundled assets referenced by the server
└─ package.json
```

## Architecture flow

1. A user prompt causes ChatGPT to call one of your MCP tools.
2. Your server runs the handler, fetches authoritative data, and returns `structuredContent`, `_meta`, and UI metadata.
3. ChatGPT loads the HTML template linked in the tool descriptor (served as `text/html+skybridge`) and injects the payload through `window.openai`.
4. The widget renders from `window.openai.toolOutput`, persists UI state with `window.openai.setWidgetState`, and can call tools again via `window.openai.callTool`.
5. The model reads `structuredContent` to narrate what happened, so keep it tight and idempotent—ChatGPT may retry tool calls.

```
User prompt
   ↓
ChatGPT model ──► MCP tool call ──► Your server ──► Tool response (`structuredContent`, `_meta`, `content`)
   │                                                   │
   └───── renders narration ◄──── widget iframe ◄──────┘
                              (HTML template + `window.openai`)
```

## Understand the `window.openai` widget runtime

The sandboxed iframe exposes a single global object:

| Category | Property | Purpose |
| --- | --- | --- |
| State & data | `toolInput` | Arguments supplied when the tool was invoked. |
| State & data | `toolOutput` | Your `structuredContent`. Keep fields concise; the model reads them verbatim. |
| State & data | `toolResponseMetadata` | The `_meta` payload; only the widget sees it, never the model. |
| State & data | `widgetState` | Snapshot of UI state persisted between renders. |
| State & data | `setWidgetState(state)` | Stores a new snapshot synchronously; call it after every meaningful UI interaction. |
| Widget runtime APIs | `callTool(name, args)` | Invoke another MCP tool from the widget (mirrors model-initiated calls). |
| Widget runtime APIs | `sendFollowUpMessage({ prompt })` | Ask ChatGPT to post a message authored by the component. |
| Widget runtime APIs | `requestDisplayMode` | Request PiP/fullscreen modes. |
| Widget runtime APIs | `requestModal` | Spawn a modal owned by ChatGPT. |
| Widget runtime APIs | `notifyIntrinsicHeight` | Report dynamic widget heights to avoid scroll clipping. |
| Widget runtime APIs | `openExternal({ href })` | Open a vetted external link in the user’s browser. |
| Context | `theme`, `displayMode`, `maxHeight`, `safeArea`, `view`, `userAgent`, `locale` | Environment signals you can read—or subscribe to via `useOpenAiGlobal`—to adapt visuals and copy. |

Use `requestModal` when you need a host-controlled overlay—for example, open a checkout or detail view anchored to an “Add to cart” button so shoppers can review options without forcing the inline widget to resize.

Subscribe to any of these fields with `useOpenAiGlobal` so multiple components stay in sync.

Here's an example React component that reads `toolOutput` and persists UI state with `setWidgetState`: 
For more information on how to build your UI, check out the [custom UX guide](https://developers.openai.com/apps-sdk/build/custom-ux).
```tsx
// Example helper hook that keeps state
// in sync with the widget runtime via window.openai.setWidgetState.


export function KanbanList() {
  const [widgetState, setWidgetState] = useWidgetState(() => ({ selectedTask: null }));
  const tasks = window.openai.toolOutput?.tasks ?? [];

  return tasks.map((task) => (
    <button
      key={task.id}
      data-selected={widgetState?.selectedTask === task.id}
      onClick={() => setWidgetState((prev) => ({ ...prev, selectedTask: task.id }))}
    >
      {task.title}
    </button>
  ));
}
```

If you're not using React, you don’t need a helper like useWidgetState. Vanilla JS widgets can read and write window.openai directly—for example, window.openai.toolOutput or window.openai.setWidgetState(state).

## Pick an SDK

Apps SDK works with any MCP implementation, but the official SDKs are the quickest way to get started. They ship tool/schema helpers, HTTP server scaffolding, resource registration utilities, and end-to-end type safety so you can stay focused on business logic:

- **Python SDK** – Iterate quickly with FastMCP or FastAPI. Repo: [`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk).
- **TypeScript SDK** – Ideal when your stack is already Node/React. Repo: [`modelcontextprotocol/typescript-sdk`](https://github.com/modelcontextprotocol/typescript-sdk), published as `@modelcontextprotocol/sdk`. Docs live on [modelcontextprotocol.io](https://modelcontextprotocol.io/).

Install whichever SDK matches your backend language, then follow the steps below.

```bash
# TypeScript / Node
npm install @modelcontextprotocol/sdk zod

# Python
pip install mcp
```

## Build your MCP server

### Step 1 – Register a component template
Each UI bundle is exposed as an MCP resource whose `mimeType` is `text/html+skybridge`, signaling to ChatGPT that it should treat the payload as a sandboxed HTML entry point and inject the widget runtime. In other words, `text/html+skybridge` marks the file as a widget template instead of generic HTML.

Register the template and include metadata for borders, domains, and CSP rules:

```ts
// Registers the Kanban widget HTML entry point served to ChatGPT.



const server = new McpServer({ name: "kanban-server", version: "1.0.0" });
const HTML = readFileSync("web/dist/kanban.js", "utf8");
const CSS = readFileSync("web/dist/kanban.css", "utf8");

server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="kanban-root"></div>
<style>${CSS}</style>
<script type="module">${HTML}</script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetCSP": {
            connect_domains: ["https://chatgpt.com"], // example API domain
            resource_domains: ["https://*.oaistatic.com"], // example CDN allowlist
          },
        },
      },
    ],
  })
);
```


**Best practice:** When you change your widget’s HTML/JS/CSS in a breaking way, give the template a new URI (or use a new file name) so ChatGPT always loads the updated bundle instead of a cached one.

### Step 2 – Describe tools

Tools are the contract the model reasons about. Define one tool per user intent (e.g., `list_tasks`, `update_task`). Each descriptor should include:

- Machine-readable name and human-readable title.
- JSON schema for arguments (`zod`, JSON Schema, or dataclasses).
- `_meta["openai/outputTemplate"]` pointing to the template URI.
- Optional `_meta` for invoking/invoked strings, `widgetAccessible`, read-only hints, etc.

*The model inspects these descriptors to decide when a tool fits the user’s request, so treat names, descriptions, and schemas as part of your UX.*

Design handlers to be **idempotent**—the model may retry calls.

```ts
// Example app that exposes a kanban-board tool with schema, metadata, and handler.


server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    inputSchema: { workspace: z.string() },
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Preparing the board…",
      "openai/toolInvocation/invoked": "Board ready.",
    },
  },
  async ({ workspace }) => {
    const board = await loadBoard(workspace);
    return {
      structuredContent: board.summary,
      content: [{ type: "text", text: `Showing board ${workspace}` }],
      _meta: board.details,
    };
  }
);
```

### Step 3 – Return structured data and metadata

Every tool response can include three sibling payloads:

- **`structuredContent`** – concise JSON the widget uses *and* the model reads. Include only what the model should see.
- **`content`** – optional narration (Markdown or plaintext) for the model’s response.
- **`_meta`** – large or sensitive data exclusively for the widget. `_meta` never reaches the model.

```ts
// Returns concise structuredContent for the model plus rich _meta for the widget.
async function loadKanbanBoard(workspace: string) {
  const tasks = await db.fetchTasks(workspace);
  return {
    structuredContent: {
      columns: ["todo", "in-progress", "done"].map((status) => ({
        id: status,
        title: status.replace("-", " "),
        tasks: tasks.filter((task) => task.status === status).slice(0, 5),
      })),
    },
    content: [
      {
        type: "text",
        text: "Here's the latest snapshot. Drag cards in the widget to update status.",
      },
    ],
    _meta: {
      tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
      lastSyncedAt: new Date().toISOString(),
    },
  };
}
```

The widget reads those payloads through `window.openai.toolOutput` and `window.openai.toolResponseMetadata`, while the model only sees `structuredContent`/`content`.

### Step 4 – Run locally

1. Build your UI bundle (`npm run build` inside `web/`).
2. Start the MCP server (Node, Python, etc.).
3. Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) early and often to call `http://localhost:<port>/mcp`, list roots, and verify your widget renders correctly. Inspector mirrors ChatGPT’s widget runtime and catches issues before deployment.

For a TypeScript project, that usually looks like:

```bash
npm run build       # compile server + widget
node dist/index.js  # start the compiled MCP server
```

### Step 5 – Expose an HTTPS endpoint

ChatGPT requires HTTPS. During development, tunnel localhost with ngrok (or similar):

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Use the ngrok URL when creating a connector in ChatGPT developer mode. For production, deploy to a low-latency HTTPS host (Cloudflare Workers, Fly.io, Vercel, AWS, etc.).

## Example

Here’s a stripped-down TypeScript server plus vanilla widget. For full projects, reference the public [Apps SDK examples](https://github.com/openai/openai-apps-sdk-examples).

```ts
// server/src/index.ts


const server = new McpServer({ name: "hello-world", version: "1.0.0" });

server.registerResource("hello", "ui://widget/hello.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/hello.html",
      mimeType: "text/html+skybridge",
      text: `
<div id="root"></div>
<script type="module" src="https://example.com/hello-widget.js"></script>
      `.trim(),
    },
  ],
}));

server.registerTool(
  "hello_widget",
  {
    title: "Show hello widget",
    inputSchema: { name: { type: "string" } },
    _meta: { "openai/outputTemplate": "ui://widget/hello.html" },
  },
  async ({ name }) => ({
    structuredContent: { message: `Hello ${name}!` },
    content: [{ type: "text", text: `Greeting ${name}` }],
    _meta: {},
  })
);
```

```js
// hello-widget.js
const root = document.getElementById("root");
const { message } = window.openai.toolOutput ?? { message: "Hi!" };
root.textContent = message;
```

## Troubleshooting

- **Widget doesn’t render** – Ensure the template resource returns `mimeType: "text/html+skybridge"` and that the bundled JS/CSS URLs resolve inside the sandbox.
- **`window.openai` is undefined** – The host only injects the widget runtime for `text/html+skybridge` templates; double-check the MIME type and that the widget loaded without CSP violations.
- **CSP or CORS failures** – Use `openai/widgetCSP` to allow the exact domains you fetch from; the sandbox blocks everything else.
- **Stale bundles keep loading** – Cache-bust template URIs or file names whenever you deploy breaking changes.
- **Structured payloads are huge** – Trim `structuredContent` to what the model truly needs; oversized payloads degrade model performance and slow rendering.

## Advanced capabilities

### Component-initiated tool calls

Set `_meta.openai/widgetAccessible: true` if the widget should call tools on its own (e.g., refresh data on a button click). That opt-in enables `window.openai.callTool`.

```json
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/widgetAccessible": true
}
```

### Content security policy (CSP)

Provide `openai/widgetCSP` so the sandbox knows which domains to allow for `connect-src`, `img-src`, etc. This is required before broad distribution.

```ts
"openai/widgetCSP": {
  connect_domains: ["https://api.example.com"],
  resource_domains: ["https://persistent.oaistatic.com"]
}
```

### Widget domains

Set `openai/widgetDomain` when you need a dedicated origin (e.g., for API key allowlists). ChatGPT renders the widget under `<domain>.web-sandbox.oaiusercontent.com`, which also enables the fullscreen punch-out button.

```ts
"openai/widgetDomain": "https://chatgpt.com"
```

### Localized content

ChatGPT includes the requested locale in `_meta["openai/locale"]` (with `_meta["webplus/i18n"]` as a legacy key). Use RFC 4647 matching to select the closest supported locale, echo it back in your responses, and format numbers/dates accordingly.

### Client context hints

Optional hints like `_meta["openai/userAgent"]` and `_meta["openai/userLocation"]` help tailor analytics or formatting, but **never** rely on them for authorization.

### Component descriptions

`openai/widgetDescription` lets the widget describe itself to the model, reducing redundant narration.

```ts
"openai/widgetDescription": "Shows an interactive zoo directory rendered by get_zoo_animals."
```

Once your templates, tools, and widget runtime are wired up, the fastest way to refine your app is to use ChatGPT itself: call your tools in a real conversation, watch your logs, and debug the widget with browser devtools. When everything looks good, put your MCP server behind HTTPS and your app is ready for users.

## Security reminders

- Treat `structuredContent`, `content`, `_meta`, and widget state as user-visible—never embed API keys, tokens, or secrets.
- Do not rely on `_meta["openai/userAgent"]`, `_meta["openai/locale"]`, or other hints for authorization; enforce auth inside your MCP server and backing APIs.
- Avoid exposing admin-only or destructive tools unless the server verifies the caller’s identity and intent.

Build custom UX:
# Build a custom UX

## Overview

UI components turn structured tool results into a human-friendly UI. Apps SDK components are typically React components that run inside an iframe, talk to the host via the `window.openai` API, and render inline with the conversation. This guide describes how to structure your component project, bundle it, and wire it up to your MCP server.

You can also check out the [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples).

## Understand the `window.openai` API

`window.openai` is the bridge between your frontend and ChatGPT. Use this quick reference to first understand how to wire up data, state, and layout concerns before you dive into component scaffolding.

```tsx
declare global {
  interface Window {
    openai: API & OpenAiGlobals;
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}

type OpenAiGlobals<
  ToolInput extends UnknownObject = UnknownObject,
  ToolOutput extends UnknownObject = UnknownObject,
  ToolResponseMetadata extends UnknownObject = UnknownObject,
  WidgetState extends UnknownObject = UnknownObject
> = {
  theme: Theme;
  userAgent: UserAgent;
  locale: string;

  // layout
  maxHeight: number;
  displayMode: DisplayMode;
  safeArea: SafeArea;

  // state
  toolInput: ToolInput;
  toolOutput: ToolOutput | null;
  toolResponseMetadata: ToolResponseMetadata | null;
  widgetState: WidgetState | null;
};

type API<WidgetState extends UnknownObject> = {
  /** Calls a tool on your MCP. Returns the full response. */
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<CallToolResponse>;

  /** Triggers a followup turn in the ChatGPT conversation */
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;

  /** Opens an external link, redirects web page or mobile app */
  openExternal(payload: { href: string }): void;

  /** For transitioning an app from inline to fullscreen or pip */
  requestDisplayMode: (args: { mode: DisplayMode }) => Promise<{
    /**
     * The granted display mode. The host may reject the request.
     * For mobile, PiP is always coerced to fullscreen.
     */
    mode: DisplayMode;
  }>;

  setWidgetState: (state: WidgetState) => Promise<void>;
};

// Dispatched when any global changes in the host page
export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";
export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE;
}

export type CallTool = (
  name: string,
  args: Record<string, unknown>
) => Promise<CallToolResponse>;

export type DisplayMode = "pip" | "inline" | "fullscreen";

export type Theme = "light" | "dark";

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};
```

### useOpenAiGlobal

Many Apps SDK projects wrap `window.openai` access in small hooks so views remain testable. This example hook listens for host `openai:set_globals` events and lets React components subscribe to a single global value:

```ts
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

`useOpenAiGlobal` is an important primitive to make your app reactive to changes in display mode, theme, and "props" via subsequent tool calls.

For example, read the tool input, output, and metadata:

```ts
export function useToolInput() {
  return useOpenAiGlobal("toolInput");
}

export function useToolOutput() {
  return useOpenAiGlobal("toolOutput");
}

export function useToolResponseMetadata() {
  return useOpenAiGlobal("toolResponseMetadata");
}
```

### Persist component state, expose context to ChatGPT

Widget state can be used for persisting data across user sessions, and exposing data to ChatGPT. Anything you pass to `setWidgetState` will be shown to the model, and hydrated into `window.openai.widgetState`

Widget state is scoped to the specific widget instance that lives on a single conversation message. When your component calls `window.openai.setWidgetState(payload)`, the host stores that payload under that widget’s `message_id/widgetId` pair and rehydrates it only for that widget. The state does not travel across the whole conversation or between different widgets.

Follow-up turns keep the same widget (and therefore the same state) only when the user submits through that widget’s controls—inline follow-ups, PiP composer, or fullscreen composer. If the user types into the main chat composer, the request is treated as a new widget run with a fresh `widgetId` and empty `widgetState`.

Anything you pass to `setWidgetState` is sent to the model, so keep the payload focused and well under 4k [tokens](https://platform.openai.com/tokenizer) for performance.

### Trigger server actions

`window.openai.callTool` lets the component directly make MCP tool calls. Use this for direct manipulations (refresh data, fetch nearby restaurants). Design tools to be idempotent where possible and return updated structured content that the model can reason over in subsequent turns.

Please note that your tool needs to be marked as [able to be initiated by the component](/apps-sdk/build/mcp-server###allow-component-initiated-tool-access).

```tsx
async function refreshPlaces(city: string) {
  await window.openai?.callTool("refresh_pizza_list", { city });
}
```

### Send conversational follow-ups

Use `window.openai.sendFollowUpMessage` to insert a message into the conversation as if the user asked it.

```tsx
await window.openai?.sendFollowUpMessage({
  prompt: "Draft a tasting itinerary for the pizzerias I favorited.",
});
```

### Request alternate layouts

If the UI needs more space—like maps, tables, or embedded editors—ask the host to change the container. `window.openai.requestDisplayMode` negotiates inline, PiP, or fullscreen presentations.

```tsx
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

### Use host-backed navigation

Skybridge (the sandbox runtime) mirrors the iframe’s history into ChatGPT’s UI. Use standard routing APIs—such as React Router—and the host will keep navigation controls in sync with your component.

Router setup (React Router’s `BrowserRouter`):

```ts
export default function PizzaListRouter() {
  return (
    

<Routes>
        }>
          } />
        </Route>
      </Routes>


  );
}
```

Programmatic navigation:

```ts
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

## Scaffold the component project

Now that you understand the `window.openai` API, it's time to scaffold your component project.

As best practice, keep the component code separate from your server logic. A common layout is:

```
app/
  server/            # MCP server (Python or Node)
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

Create the project and install dependencies (Node 18+ recommended):

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

If your component requires drag-and-drop, charts, or other libraries, add them now. Keep the dependency set lean to reduce bundle size.

## Author the React component

Your entry file should mount a component into a `root` element and read initial data from `window.openai.toolOutput` or persisted state.

We have provided some example apps under the [examples page](./examples#pizzaz-list-source), for example, for a "Pizza list" app, which is a list of pizza restaurants.

### Explore the Pizzaz component gallery

We provide a number of example components in the [Apps SDK examples](/apps-sdk/build/examples). Treat them as blueprints when shaping your own UI:

- **Pizzaz List** – ranked card list with favorites and call-to-action buttons.  
  ![Screenshot of the Pizzaz list component](/images/apps-sdk/pizzaz-list.png)
- **Pizzaz Carousel** – embla-powered horizontal scroller that demonstrates media-heavy layouts.  
  ![Screenshot of the Pizzaz carousel component](/images/apps-sdk/pizzaz-carousel.png)
- **Pizzaz Map** – Mapbox integration with fullscreen inspector and host state sync.  
  ![Screenshot of the Pizzaz map component](/images/apps-sdk/pizzaz-map.png)
- **Pizzaz Album** – stacked gallery view built for deep dives on a single place.  
  ![Screenshot of the Pizzaz album component](/images/apps-sdk/pizzaz-album.png)
- **Pizzaz Video** – scripted player with overlays and fullscreen controls.

Each example shows how to bundle assets, wire host APIs, and structure state for real conversations. Copy the one closest to your use case and adapt the data layer for your tool responses.

### React helper hooks

Using `useOpenAiGlobal` in a `useWidgetState` hook to keep host-persisted widget state aligned with your local React state:

```ts
export function useWidgetState<T extends WidgetState>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  const widgetStateFromWindow = useWebplusGlobal("widgetState") as T;

  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }

    return typeof defaultState === "function"
      ? defaultState()
      : defaultState ?? null;
  });

  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === "function" ? state(prevState) : state;

        if (newState != null) {
          window.openai.setWidgetState(newState);
        }

        return newState;
      });
    },
    [window.openai.setWidgetState]
  );

  return [widgetState, setWidgetState] as const;
}
```

The hooks above make it easy to read the latest tool output, layout globals, or widget state directly from React components while still delegating persistence back to ChatGPT.

## Bundle for the iframe

Once you are done writing your React component, you can build it into a single JavaScript module that the server can inline:

```json
// package.json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

Run `npm run build` to produce `dist/component.js`. If esbuild complains about missing dependencies, confirm you ran `npm install` in the `web/` directory and that your imports match installed package names (e.g., `@react-dnd/html5-backend` vs `react-dnd-html5-backend`).

## Embed the component in the server response

See the [Set up your server docs](/apps-sdk/build/mcp-server#) for how to embed the component in your MCP server response.

Component UI templates are the recommended path for production.

During development you can rebuild the component bundle whenever your React code changes and hot-reload the server.

Manage state:
# Managing State

## Managing State in ChatGPT Apps
This guide explains how to manage state for custom UI components rendered inside ChatGPT when building an app using the Apps SDK and an MCP server. You’ll learn how to decide where each piece of state belongs and how to persist it across renders and conversations.

## Overview

State in a ChatGPT app falls into three categories:

| State type | Owned by | Lifetime | Examples |
|---|---|---|---|
| **Business data (authoritative)** | MCP server or backend service | Long-lived | Tasks, tickets, documents |
| **UI state (ephemeral)** | The widget instance inside ChatGPT | Only for the active widget | Selected row, expanded panel, sort order |
| **Cross-session state (durable)** | Your backend or storage | Cross-session and cross-conversation | Saved filters, view mode, workspace selection |

Place every piece of state where it belongs so the UI stays consistent and the chat matches the expected intent.

---

## How UI Components Live Inside ChatGPT

When your app returns a custom UI component, ChatGPT renders that component inside a widget that is tied to a specific message in the conversation. The widget persists as long as that message exists in the thread.

**Key behavior:**

- **Widgets are message-scoped:** Every response that returns a widget creates a fresh instance with its own UI state.
- **UI state sticks with the widget:** When you reopen or refresh the same message, the widget restores its saved state (selected row, expanded panel, etc.).
- **Server data drives the truth:** The widget only sees updated business data when a tool call completes, and then it reapplies its local UI state on top of that snapshot.

### Mental model

The widget’s UI and data layers work together like this:

```text
Server (MCP or backend)
│
├── Authoritative business data (source of truth)
│
▼
ChatGPT Widget
│
├── Ephemeral UI state (visual behavior)
│
└── Rendered view = authoritative data + UI state
```

This separation keeps UI interaction smooth while ensuring data correctness.

---

## 1. Business State (Authoritative)

Business data is the **source of truth**.  
It should live on your MCP server or backend, not inside the widget.

When the user takes an action:

1. The UI calls a server tool.
2. The server updates data.
3. The server returns the new authoritative snapshot.
4. The widget re-renders using that snapshot.

This prevents divergence between UI and server.

### Example: Returning authoritative state from an MCP server (Node.js)

```js



const tasks = new Map(); // replace with your DB or external service
let nextId = 1;

const server = new Server({
  tools: {
    get_tasks: {
      description: "Return all tasks",
      inputSchema: jsonSchema.object({}),
      async run() {
        return {
          structuredContent: {
            type: "taskList",
            tasks: Array.from(tasks.values()),
          }
        };
      }
    },
    add_task: {
      description: "Add a new task",
      inputSchema: jsonSchema.object({ title: jsonSchema.string() }),
      async run({ title }) {
        const id = `task-${nextId++}`; // simple example id
        tasks.set(id, { id, title, done: false });

        // Always return updated authoritative state
        return this.tools.get_tasks.run({});
      }
    }
  }
});

server.start();
```
---

## 2. UI State (Ephemeral)

UI state describes **how** data is being viewed, not the data itself.

Widgets do not automatically re-sync UI state when new server data arrives. Instead, the widget keeps its UI state and re-applies it when authoritative data is refreshed.

Store UI state inside the widget instance using:

- `window.openai.widgetState` – read the current widget-scoped state snapshot.
- `window.openai.setWidgetState(newState)` – write the next snapshot. The call is synchronous; persistence happens in the background.

React apps should use the provided `useWidgetState` hook instead of reading globals directly. The hook:

- Hydrates initial state from `window.openai.widgetState` (or the initializer you pass in).
- Subscribes to future updates via `useOpenAiGlobal("widgetState")`.
- Mirrors writes back through `window.openai.setWidgetState`, so the widget stays in sync even if multiple components mutate the same state.

Because the host persists widget state asynchronously, there is nothing to `await` when you call `window.openai.setWidgetState`. Treat it just like updating local component state and call it immediately after every meaningful UI-state change.

### Example (React component)

This example assumes you copied the `useWidgetState` helper from the [Custom UX guide](/apps-sdk/build/custom-ux) (or defined it yourself) and are importing it from your project.

```tsx


export function TaskList({ data }) {
  const [widgetState, setWidgetState] = useWidgetState(() => ({
    selectedId: null,
  }));

  const selectTask = (id) => {
    setWidgetState((prev) => ({ ...prev, selectedId: id }));
  };

  return (
    <ul>
      {data.tasks.map((task) => (
        <li
          key={task.id}
          style={{
            fontWeight: widgetState?.selectedId === task.id ? "bold" : "normal",
          }}
          onClick={() => selectTask(task.id)}
        >
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

### Example (vanilla JS component)

```js
const tasks = window.openai.toolOutput?.tasks ?? [];
let widgetState = window.openai.widgetState ?? { selectedId: null };

function selectTask(id) {
  widgetState = { ...widgetState, selectedId: id };
  window.openai.setWidgetState(widgetState);
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.innerHTML = tasks
    .map(
      (task) => `
        <li
          style="font-weight: ${widgetState.selectedId === task.id ? "bold" : "normal"}"
          onclick="selectTask('${task.id}')"
        >
          ${task.title}
        </li>
      `
    )
    .join("");
}

renderTasks();
```

---

## 3. Cross-session state 

Preferences that must persist across conversations, devices, or sessions should be stored in your backend.

Apps SDK handles conversation state automatically, but most real-world apps also need durable storage. You might cache fetched data, keep track of user preferences, or persist artifacts created inside a component. Choosing to add a storage layer adds additional capabilities, but also complexity. 

## Bring your own backend

If you already run an API or need multi-user collaboration, integrate with your existing storage layer. In this model:

- Authenticate the user via OAuth (see [Authentication](/apps-sdk/build/auth)) so you can map ChatGPT identities to your internal accounts.
- Use your backend’s APIs to fetch and mutate data. Keep latency low; users expect components to render in a few hundred milliseconds.
- Return sufficient structured content so the model can understand the data even if the component fails to load.

When you roll your own storage, plan for:

- **Data residency and compliance** – ensure you have agreements in place before transferring PII or regulated data.
- **Rate limits** – protect your APIs against bursty traffic from model retries or multiple active components.
- **Versioning** – include schema versions in stored objects so you can migrate them without breaking existing conversations.

### Example: Widget invokes a tool

```tsx


export function PreferencesForm({ userId, initialPreferences }) {
  const [formState, setFormState] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreferences(next) {
    setIsSaving(true);
    setFormState(next);
    window.openai.setWidgetState(next);

    const result = await window.openai.callTool("set_preferences", {
      userId,
      preferences: next,
    });

    const updated = result?.structuredContent?.preferences ?? next;
    setFormState(updated);
    window.openai.setWidgetState(updated);
    setIsSaving(false);
  }

  return (
    <form>
      {/* form fields bound to formState */}
      <button type="button" disabled={isSaving} onClick={() => savePreferences(formState)}>
        {isSaving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
```

### Example: Server handles the tool (Node.js)

```js




// Helpers that call your existing backend API
async function readPreferences(userId) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
  });
  if (response.statusCode === 404) return {};
  if (response.statusCode >= 400) throw new Error("Failed to load preferences");
  return await response.body.json();
}

async function writePreferences(userId, preferences) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preferences)
  });
  if (response.statusCode >= 400) throw new Error("Failed to save preferences");
  return await response.body.json();
}

const server = new Server({
  tools: {
    get_preferences: {
      inputSchema: jsonSchema.object({ userId: jsonSchema.string() }),
      async run({ userId }) {
        const preferences = await readPreferences(userId);
        return { structuredContent: { type: "preferences", preferences } };
      }
    },
    set_preferences: {
      inputSchema: jsonSchema.object({
        userId: jsonSchema.string(),
        preferences: jsonSchema.object({})
      }),
      async run({ userId, preferences }) {
        const updated = await writePreferences(userId, preferences);
        return { structuredContent: { type: "preferences", preferences: updated } };
      }
    }
  }
});
```

---

## Summary

- Store **business data** on the server.
- Store **UI state** inside the widget using `window.openai.widgetState`, `window.openai.setWidgetState`, or the `useWidgetState` hook.
- Store **cross-session state** in backend storage you control.
- Widget state persists only for the widget instance belonging to a specific message.
- Avoid using `localStorage` for core state.

Reference:
# Reference

## `window.openai` component bridge

See [build a custom UX](/apps-sdk/build/custom-ux)

## Tool descriptor parameters

By default, a tool description should include the fields listed [here](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool).

### `_meta` fields on tool descriptor

We have also require the following `_meta` fields on the tool descriptor:

| Key | Placement | Type | Limits | Purpose |
| --- | :---: | --- | --- | --- |
| `_meta["securitySchemes"]` | Tool descriptor | array | — | Back-compat mirror for clients that only read `_meta`. |
| `_meta["openai/outputTemplate"]` | Tool descriptor | string (URI) | — | Resource URI for component HTML template (`text/html+skybridge`). |
| `_meta["openai/widgetAccessible"]` | Tool descriptor | boolean | default `false` | Allow component→tool calls through the client bridge. |
| `_meta["openai/toolInvocation/invoking"]` | Tool descriptor | string | ≤ 64 chars | Short status text while the tool runs. |
| `_meta["openai/toolInvocation/invoked"]` | Tool descriptor | string | ≤ 64 chars | Short status text after the tool completes. |

Example:

```ts
server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"]
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] }
    ],
    _meta: {
      securitySchemes: [
        { type: "noauth" },
        { type: "oauth2", scopes: ["search.read"] }
      ],
      "openai/outputTemplate": "ui://widget/story.html",
      "openai/toolInvocation/invoking": "Searching…",
      "openai/toolInvocation/invoked": "Results ready"
    }
  },
  async ({ q }) => performSearch(q)
);
```

### Annotations

To label a tool as "read-only", please use the following [annotation](https://modelcontextprotocol.io/specification/2025-06-18/server/resources#annotations) on the tool descriptor:

| Key | Type | Required | Notes |
| --- | --- | :---: | --- |
| `readOnlyHint` | boolean | Optional | Signal that the tool is read-only (helps model planning). |

Example:

```ts
server.registerTool(
  "list_saved_recipes",
  {
    title: "List saved recipes",
    description: "Returns the user’s saved recipes without modifying them.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true }
  },
  async () => fetchSavedRecipes()
);
```


## Component resource `_meta` fields

Set these keys on the resource template that serves your component (`registerResource`). They help ChatGPT describe and frame the rendered iframe without leaking metadata to other clients.

| Key | Placement | Type | Purpose |
| --- | :---: | --- | --- |
| `_meta["openai/widgetDescription"]` | Resource contents | string | Human-readable summary surfaced to the model when the component loads, reducing redundant assistant narration. |
| `_meta["openai/widgetPrefersBorder"]` | Resource contents | boolean | Hint that the component should render inside a bordered card when supported. |
| `_meta["openai/widgetCSP"]` | Resource contents | object | Define `connect_domains` and `resource_domains` arrays for the component’s CSP snapshot. |
| `_meta["openai/widgetDomain"]` | Resource contents | string (origin) | Optional dedicated subdomain for hosted components (defaults to `https://web-sandbox.oaiusercontent.com`). |

Example:

```ts
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals.",
        "openai/widgetPrefersBorder": true,
        "openai/widgetCSP": {
          connect_domains: [],
          resource_domains: ["https://persistent.oaistatic.com"],
        },
        "openai/widgetDomain": "https://chatgpt.com",
      },
    },
  ],
}));
```

## Tool results

Tool results can contain the following [fields](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result). Notably:

| Key                | Type                   | Required  | Notes |
|--------------------|------------------------|-----------|---------------------------------------------------------------------|
| `structuredContent`| object                 | Optional  | Surfaced to the model and the component. Must match the declared `outputSchema`, when provided. |
| `content`          | string or `Content[]`  | Optional  | Surfaced to the model and the component. |
| `_meta`            | object                 | Optional  | Delivered only to the component. Hidden from the model. |

Only `structuredContent` and `content` appear in the conversation transcript. `_meta` is forwarded to the component so you can hydrate UI without exposing the data to the model.

Example:

```ts
server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    _meta: { "openai/outputTemplate": "ui://widget/widget.html" }
  },
  async ({ count = 10 }) => {
    const animals = generateZooAnimals(count);

    return {
      structuredContent: { animals },
      content: [{ type: "text", text: `Here are ${animals.length} animals.` }],
      _meta: {
        allAnimalsById: Object.fromEntries(animals.map((animal) => [animal.id, animal]))
      }
    };
  }
);
```

### Error tool result

To return an error on the tool result, use the following `_meta` key:

| Key                                 | Purpose      | Type                | Notes                                                      |
|------------------------------------- |------------- |---------------------|------------------------------------------------------------|
| `_meta["mcp/www_authenticate"]`      | Error result | string or string[]  | RFC 7235 `WWW-Authenticate` challenges to trigger OAuth.   |


## `_meta` fields the client provides

| Key | When provided | Type | Purpose |
| --- | --- | --- | --- |
| `_meta["openai/locale"]` | Initialize + tool calls | string (BCP 47) | Requested locale (older clients may send `_meta["webplus/i18n"]`). |
| `_meta["openai/userAgent"]` | Tool calls | string | User agent hint for analytics or formatting. |
| `_meta["openai/userLocation"]` | Tool calls | object | Coarse location hint (`city`, `region`, `country`, `timezone`, `longitude`, `latitude`). |
| `_meta["openai/subject"]` | Tool calls | string | Anonymized user id sent to MCP servers for the purposes of rate limiting and identification |

Operation-phase `_meta["openai/userAgent"]` and `_meta["openai/userLocation"]` are hints only; servers should never rely on them for authorization decisions and must tolerate their absence.

Example:

```ts
server.registerTool(
  "recommend_cafe",
  {
    title: "Recommend a cafe",
    inputSchema: { type: "object" }
  },
  async (_args, { _meta }) => {
    const locale = _meta?.["openai/locale"] ?? "en";
    const location = _meta?.["openai/userLocation"]?.city;

    return {
      content: [{ type: "text", text: formatIntro(locale, location) }],
      structuredContent: await findNearbyCafes(location)
    };
  }
);
```