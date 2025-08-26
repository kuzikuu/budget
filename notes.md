# Vercel Functions

Vercel Functions lets you run server-side code without managing servers. They adapt automatically to user demand, handle connections to APIs and databases, and offer enhanced concurrency through [fluid compute](/docs/fluid-compute), which is useful for AI workloads or any I/O-bound tasks that require efficient scaling

When you deploy your application, Vercel automatically sets up the tools and optimizations for your chosen [framework](/docs/frameworks). It ensures low latency by routing traffic through Vercel's [Edge Network](/docs/edge-network), and placing your functions in a specific region when you need more control over [data locality](/docs/functions#functions-and-your-data-source).

![Functions location within Vercel's managed infrastructure](/vc-ap-vercel-docs/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1737717848%2Ffront%2Fdocs%2Fvercel-functions%2Ffirst_image_light.png&w=3840&q=75)![Functions location within Vercel's managed infrastructure](/vc-ap-vercel-docs/_next/image?url=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Fv1737717848%2Ffront%2Fdocs%2Fvercel-functions%2Ffirst_image_dark.png&w=3840&q=75)

Functions location within Vercel's managed infrastructure

## [Getting started](#getting-started)

To get started with creating your first function, copy the code below:

Next.js (/app)Next.js (/pages)Other frameworks

```
export function GET(request: Request) {
  return new Response('Hello from Vercel!');
}
```

To learn more, see the [quickstart](/docs/functions/quickstart) or [deploy a template](/templates).

## [Functions lifecycle](#functions-lifecycle)

Vercel Functions run in a single [region](/docs/functions/configuring-functions/region) by default, although you can configure them to run in multiple regions if you have globally replicated data. These functions let you add extra capabilities to your application, such as handling authentication, streaming data, or querying databases.

When a user sends a request to your site, Vercel can automatically run a function based on your application code. You do not need to manage servers, or handle scaling.

Vercel creates a new function invocation for each incoming request. If another request arrives soon after the previous one, Vercel [reuses the same function](/docs/fluid-compute#optimized-concurrency) instance to optimize performance and cost efficiency. Over time, Vercel only keeps as many active functions as needed to handle your traffic. Vercel scales your functions down to zero when there are no incoming requests.

By allowing concurrent execution within the same instance (and so using idle time for compute), fluid compute reduces cold starts, lowers latency, and saves on compute costs. It also prevents the need to spin up multiple isolated instances when tasks spend most of their time waiting for external operations.

### [Functions and your data source](#functions-and-your-data-source)

Functions should always execute close to where your data source is to reduce latency. By default, functions using the Node.js runtime execute in Washington, D.C., USA (`iad1`), a common location for external data sources. You can set a new region through your [project's settings on Vercel](/docs/functions/configuring-functions/region#setting-your-default-region).

## [Viewing Vercel Function metrics](#viewing-vercel-function-metrics)

You can view various performance and cost efficiency metrics using Vercel Observability:

1.  Choose your project from the [dashboard](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D&title=Go+to+dashboard).
2.  Click on the Observability tab and select the Vercel Functions section.
3.  Click on the chevron icon to expand and see all charts.

From here, you'll be able to see total consumed and saved GB-Hours, and the ratio of the saved usage. When you have [fluid](/docs/fluid-compute) enabled, you will also see the amount of cost savings from the [optimized concurrency model](/docs/fluid-compute#optimized-concurrency).

## [Pricing](#pricing)

Vercel Functions are priced based on active CPU, provisioned memory, and invocations. See the [fluid compute pricing](/docs/fluid-compute/pricing) documentation for more information.

If your project is not using fluid compute, see the [legacy pricing documentation](/docs/functions/usage-and-pricing) for Vercel Functions.

## [Related](#related)

*   [What is compute?](/docs/fundamentals/what-is-compute)
*   [What is streaming?](/docs/fundamentals/what-is-streaming)
*   [Fluid compute](/docs/fluid-compute)
*   [Runtimes](/docs/functions/runtimes)
*   [Configuring functions](/docs/functions/configuring-functions)
*   [Streaming](/docs/functions/streaming-functions)
*   [Limits](/docs/functions/limitations)
*   [Functions logs](/docs/functions/logs)

Last updated on August 11, 2025

# Getting started with Vercel Functions

In this guide, you'll learn how to get started with Vercel Functions using your favorite [frontend framework](/docs/frameworks) (or no framework).

## [Prerequisites](#prerequisites)

*   You can use an existing project or create a new one. If you don't have one, you can run the following terminal command to create a Next.js project:
    
    ```
    npx create-next-app@latest --typescript
    ```
    

## [Create a Vercel Function](#create-a-vercel-function)

Open the code block in v0 for a walk through on creating a Vercel Function with the below code, or copy the code into your project. The function fetches data from the [Vercel API](https://api.vercel.app/products) and returns it as a JSON response.

Next.js (/app)Next.js (/pages)Other frameworks

```
export function GET(request: Request) {
  const response = await fetch('https://api.vercel.app/products');
  const products = await response.json();
  return Response.json(products);
}
```

## [Next steps](#next-steps)

Now that you have set up a Vercel Function, you can explore the following topics to learn more:

*   [Explore the functions API reference](/docs/functions/functions-api-reference): Learn more about creating a Vercel Function.
*   [Learn about streaming functions](/docs/functions/streaming-functions): Learn how to fetch streamable data with Vercel Functions.
*   [Choosing a Runtime](/docs/functions/runtimes): Learn more about the differences between the Node.js and Edge runtimes.
*   [Configuring Functions](/docs/functions/configuring-functions): Learn about the different options for configuring a Vercel Function.

Last updated on July 18, 2025

# Streaming

AI providers can be slow when producing responses, but many make their responses available in chunks as they're processed. Streaming enables you to show users those chunks of data as they arrive rather than waiting for the full response, improving the perceived speed of AI-powered apps.

Vercel recommends using [Vercel's AI SDK](https://sdk.vercel.ai/docs) to stream responses from LLMs and AI APIs. It reduces the boilerplate necessary for streaming responses from AI providers and allows you to change AI providers with a few lines of code, rather than rewriting your entire application.

## [Getting started](#getting-started)

The following example shows how to send a message to one of OpenAI's models and streams:

### [Prerequisites](#prerequisites)

1.  You should understand how to setup a Vercel Function. See the [Functions quickstart](/docs/functions/quickstart) for more information.
2.  You should also have a fundamental understanding of how streaming works on Vercel. To learn more see [What is streaming?](/docs/fundamentals/what-is-streaming).
3.  You should be using Node.js 18 or later and the [latest version](/docs/cli#updating-vercel-cli) of the Vercel CLI.
4.  You should copy your OpenAI API key in the `.env.local` file with name `OPENAI_API_KEY`. See the [AI SDK docs](https://sdk.vercel.ai/docs/getting-started#configure-openai-api-key) for more information on how to do this.
5.  Install the `ai` and `@ai-sdk/openai` packages:
    
    pnpmyarnnpmbun
    
    ```
    pnpm i ai openai
    ```
    

Next.js (/app)Next.js (/pages)Other frameworks

```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
 
// This method must be named GET
export async function GET() {
  // Make a request to OpenAI's API based on
  // a placeholder prompt
  const response = streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'user', content: 'What is the capital of Australia?' }],
  });
  // Respond with the stream
  return response.toTextStreamResponse({
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
}
```

## [Function duration](#function-duration)

If your workload requires longer durations, you should consider enabling [fluid compute](/docs/fluid-compute), which has [higher default max durations and limits across plans](/docs/fluid-compute#default-settings-by-plan).

Maximum durations can be configured for Node.js functions to enable streaming responses for longer periods. See [max durations](/docs/functions/limitations#max-duration) for more information.

## [Streaming Python functions](#streaming-python-functions)

You can stream responses from Vercel Functions that use the Python runtime.

When your function is streaming, it will be able to take advantage of the extended [runtime logs](/docs/functions/logs#runtime-logs), which will show you the real-time output of your function, in addition to larger and more frequent log entries. Because of this potential increase in frequency and format, your [Log Drains](/docs/log-drains) may be affected. We recommend ensuring that your ingestion can handle both the new format and frequency.

## [More resources](#more-resources)

*   [What is streaming?](/docs/functions/streaming)
*   [AI SDK](https://sdk.vercel.ai/docs/getting-started)
*   [Vercel Functions](/docs/functions)
*   [Fluid compute](/docs/fluid-compute)
*   [Streaming and SEO: Does streaming affect SEO?](/guides/does-streaming-affect-seo)
*   [Processing data chunks: Learn how to process data chunks](/guides/processing-data-chunks)
*   [Handling backpressure: Learn how to handle backpressure](/guides/handling-backpressure)

Last updated on July 18, 2025

