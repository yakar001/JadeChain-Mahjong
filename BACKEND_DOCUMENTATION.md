
# Backend Development Documentation

This document outlines the backend architecture and development practices for the QuanJin Mahjong application.

## 1. Technology Stack

The backend is built using a modern serverless approach leveraging the Next.js App Router and Genkit for AI functionalities.

-   **Framework**: Next.js (App Router)
-   **Primary Logic**: Next.js Server Actions
-   **AI Integration**: Google Genkit

This architecture allows for seamless integration of frontend components with backend logic, reducing the need for separate API endpoints and simplifying data fetching and mutations.

## 2. Project Structure

Key backend-related files and directories are organized as follows:

```
/
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   └── suggest-move.ts   # Defines the Genkit AI flow
│   │   ├── dev.ts                # Genkit development server entry point
│   │   └── genkit.ts             # Genkit global configuration
│   │
│   └── app/
│       └── actions.ts            # Server Actions entry point
│
└── BACKEND_DOCUMENTATION.md      # This file
```

-   `src/ai/`: Contains all Genkit-related code.
    -   `flows/`: Each file in this directory defines a specific AI-powered flow. A flow orchestrates calls to language models, tools, and other logic.
    -   `genkit.ts`: Central configuration for Genkit, including plugins (like Google AI) and default model settings.
-   `src/app/actions.ts`: This file exposes server-side logic to the client-side components using Server Actions. It acts as the primary bridge between the UI and the backend logic, including AI flows.

## 3. AI Flow Development (Genkit)

We use Genkit to define and manage our AI-powered features. The primary example is the `suggest-move` flow.

### How to Create a New AI Flow

1.  **Create a New File**: Add a new file in `src/ai/flows/`, for example, `new-feature-flow.ts`.
2.  **Add `'use server';`**: Start the file with the `'use server';` directive.
3.  **Define Schemas**: Use `zod` to define the input and output schemas for your flow. This ensures type safety and provides structured data for the AI model.
    ```typescript
    import { z } from 'genkit';

    const MyFeatureInputSchema = z.object({
      promptText: z.string().describe('The user input text.'),
    });
    export type MyFeatureInput = z.infer<typeof MyFeatureInputSchema>;

    const MyFeatureOutputSchema = z.object({
      result: z.string().describe('The generated result from the AI.'),
    });
    export type MyFeatureOutput = z.infer<typeof MyFeatureOutputSchema>;
    ```
4.  **Define the Prompt**: Use `ai.definePrompt` to create a reusable, typed prompt. The `prompt` field uses Handlebars templating (`{{{...}}}`) to insert input variables.
    ```typescript
    import { ai } from '@/ai/genkit';

    const prompt = ai.definePrompt({
      name: 'myFeaturePrompt',
      input: { schema: MyFeatureInputSchema },
      output: { schema: MyFeatureOutputSchema },
      prompt: `Given the following text: {{{promptText}}}, generate a result.`,
    });
    ```
5.  **Define the Flow**: Use `ai.defineFlow` to wrap the prompt logic. The flow is an async function that receives the typed input and returns the typed output.
    ```typescript
    const myFeatureFlow = ai.defineFlow(
      {
        name: 'myFeatureFlow',
        inputSchema: MyFeatureInputSchema,
        outputSchema: MyFeatureOutputSchema,
      },
      async (input) => {
        const { output } = await prompt(input);
        return output!;
      }
    );
    ```
6.  **Export a Wrapper Function**: Create and export an async wrapper function that calls the flow. This is the function that will be imported by your Server Action.
    ```typescript
    export async function runMyFeature(input: MyFeatureInput): Promise<MyFeatureOutput> {
      return myFeatureFlow(input);
    }
    ```
7.  **Register the Flow**: Import your new flow file in `src/ai/dev.ts` so the Genkit development server recognizes it.
    ```typescript
    // src/ai/dev.ts
    import '@/ai/flows/suggest-move.ts';
    import '@/ai/flows/new-feature-flow.ts'; // Add this line
    ```

## 4. Server Actions

Server Actions are the interface between the client (React components) and the backend (Genkit flows, database logic, etc.).

### How to Expose an AI Flow to the Client

1.  **Open `src/app/actions.ts`**: This is the central file for all server actions.
2.  **Import the Flow**: Import the wrapper function and types from your new flow file.
    ```typescript
    import { runMyFeature, MyFeatureInput, MyFeatureOutput } from '@/ai/flows/new-feature-flow';
    ```
3.  **Create and Export a Server Action**: Create a new `async` function that calls your flow's wrapper function. This function can now be directly imported and called from any client component.
    ```typescript
    export async function getMyFeatureResult(input: MyFeatureInput): Promise<MyFeatureOutput> {
      return runMyFeature(input);
    }
    ```

This completes the backend setup for the new feature, making it available for use in the UI.

    