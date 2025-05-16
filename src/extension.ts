// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// Interface for OneTimeSecret API response
interface OneTimeSecretResponse {
  success: boolean;
  shrimp: string;
  custid: string;
  record: {
    metadata: {
      identifier: string;
      // Other metadata fields...
    };
    secret: {
      identifier: string;
      // Other secret fields...
    };
  };
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Register the shareSelectedText command
  const shareSelectedTextDisposable = vscode.commands.registerCommand(
    "onetimesecret.shareSelectedText",
    async () => {
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
          title: "Creating OneTimeSecret...",
          cancellable: false,
        },
        async () => {
          try {
            // Prepare the request payload
            const payload: {
              secret: {
                secret: string;
                ttl: string;
                passphrase?: string;
              };
            } = {
              secret: {
                secret: selectedText,
                ttl: "604800", // 7 days in seconds
              },
            };

            // Add passphrase if provided
            if (passphrase) {
              payload.secret.passphrase = passphrase;
            }

            // Make the API request
            const response = await fetch(
              "https://eu.onetimesecret.com/api/v2/secret/conceal",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify(payload),
              }
            );

            if (!response.ok) {
              throw new Error(
                `API request failed with status ${response.status}`
              );
            }

            const data = (await response.json()) as OneTimeSecretResponse;
            if (!data.success) {
              throw new Error("API request was not successful");
            }

            const secretUrl = `https://eu.onetimesecret.com/secret/${data.record.secret.identifier}`;

            // Show success message with Copy URL action
            const copyAction = "Copy URL";
            const selectedAction = await vscode.window.showInformationMessage(
              "OneTimeSecret has been created",
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
    }
  );

  context.subscriptions.push(shareSelectedTextDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
