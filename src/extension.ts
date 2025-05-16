// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { z } from "zod";

/**
 * Constants for region-specific settings
 * Each region defines its API base URL and web URL for generating the secret links
 */
const REGION = {
  EU: {
    title: "EU Region",
    apiBaseUrl: "https://eu.onetimesecret.com/api/v2",
    webBaseUrl: "https://eu.onetimesecret.com/secret"
  },
  US: {
    title: "US Region",
    apiBaseUrl: "https://us.onetimesecret.com/api/v2",
    webBaseUrl: "https://us.onetimesecret.com/secret"
  }
};

/**
 * Constants for TTL (Time-To-Live) settings
 * Each setting contains the TTL value in seconds and a human-readable display string
 */
const TTL = {
  SEVEN_DAYS: { value: "604800", display: "7 days" },  // 7 days in seconds
  ONE_DAY: { value: "86400", display: "1 day" },       // 1 day in seconds
  ONE_HOUR: { value: "3600", display: "1 hour" }       // 1 hour in seconds
};

// Schema for OneTimeSecret API request
const SecretRequestSchema = z.object({
  secret: z.object({
    secret: z.string(),
    ttl: z.string(),
    passphrase: z.string().optional()
  })
});

// Schema for OneTimeSecret API response
const SecretResponseSchema = z.object({
  success: z.boolean(),
  shrimp: z.string(),
  custid: z.string(),
  record: z.object({
    metadata: z.object({
      identifier: z.string(),
      // Other metadata fields would be defined here if needed
    }).passthrough(),
    secret: z.object({
      identifier: z.string(),
      // Other secret fields would be defined here if needed
    }).passthrough(),
  }),
  details: z.object({}).passthrough()
});

// Infer types from schemas
type SecretRequest = z.infer<typeof SecretRequestSchema>;
type SecretResponse = z.infer<typeof SecretResponseSchema>;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  /**
   * Shared function to handle creating a one-time secret
   * This function handles:
   * 1. Getting the selected text from the active editor
   * 2. Prompting for an optional passphrase
   * 3. Making the API request to the appropriate region
   * 4. Handling the response and providing a "Copy URL" action
   * 
   * @param regionConfig - The region configuration (EU or US)
   * @param ttlConfig - The TTL configuration (7 days, 1 day, or 1 hour)
   */
  const shareSelectedText = async (regionConfig: typeof REGION.EU | typeof REGION.US, ttlConfig: typeof TTL.SEVEN_DAYS) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found");
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showErrorMessage("No text selected");
      return;
    }

    const selectedText = editor.document.getText(selection);

    // Prompt user for optional passphrase
    const passphrase = await vscode.window.showInputBox({
      prompt: "Enter a passphrase to protect your secret (optional)",
      password: true,
      placeHolder: "Leave empty for no passphrase",
    });

    // Show progress while creating the secret
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Creating OneTimeSecret (${regionConfig.title})...`,
        cancellable: false,
      },
      async () => {
        try {
          // Prepare the request payload
          const payload: SecretRequest = {
            secret: {
              secret: selectedText,
              ttl: ttlConfig.value,
            },
          };

          // Add passphrase if provided
          if (passphrase) {
            payload.secret.passphrase = passphrase;
          }

          // Validate the payload using Zod
          let validatedPayload;
          try {
            validatedPayload = SecretRequestSchema.parse(payload);
          } catch (validationError) {
            console.error('Payload validation error:', validationError);
            throw new Error('Failed to validate request payload');
          }

          // Make the API request
          const response = await fetch(
            `${regionConfig.apiBaseUrl}/secret/conceal`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(validatedPayload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `API request failed with status ${response.status}`
            );
          }

          const responseData = await response.json();
          
          // Validate the response using Zod
          let data;
          try {
            data = SecretResponseSchema.parse(responseData);
            if (!data.success) {
              throw new Error("API request was not successful");
            }
          } catch (validationError) {
            console.error('Response validation error:', validationError);
            throw new Error('Failed to validate API response');
          }

          const secretUrl = `${regionConfig.webBaseUrl}/${data.record.secret.identifier}`;

          // Show success message with Copy URL action
          const copyAction = "Copy URL";
          const selectedAction = await vscode.window.showInformationMessage(
            `OneTimeSecret has been created (${regionConfig.title}, expires in ${ttlConfig.display})`,
            copyAction
          );

          // Handle Copy URL action
          if (selectedAction === copyAction) {
            await vscode.env.clipboard.writeText(secretUrl);
            vscode.window.showInformationMessage(
              "Secret URL copied to clipboard"
            );
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to create OneTimeSecret: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    );
  };
  
  // Register EU Region commands
  const shareEU7dDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextEU7d",
    () => shareSelectedText(REGION.EU, TTL.SEVEN_DAYS)
  );
  
  const shareEU1dDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextEU1d", 
    () => shareSelectedText(REGION.EU, TTL.ONE_DAY)
  );
  
  const shareEU1hDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextEU1h", 
    () => shareSelectedText(REGION.EU, TTL.ONE_HOUR)
  );
  
  // Register US Region commands
  const shareUS7dDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextUS7d", 
    () => shareSelectedText(REGION.US, TTL.SEVEN_DAYS)
  );
  
  const shareUS1dDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextUS1d", 
    () => shareSelectedText(REGION.US, TTL.ONE_DAY)
  );
  
  const shareUS1hDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedTextUS1h", 
    () => shareSelectedText(REGION.US, TTL.ONE_HOUR)
  );

  context.subscriptions.push(
    shareEU7dDisposable,
    shareEU1dDisposable,
    shareEU1hDisposable,
    shareUS7dDisposable,
    shareUS1dDisposable,
    shareUS1hDisposable
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
