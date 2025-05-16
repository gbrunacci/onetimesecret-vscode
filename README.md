# OneTimeSecret for VS Code

Share code snippets securely with teammates, clients, or collaborators using self-destructing links.

![Watch Demo](https://github.com/gbrunacci/onetimesecret-vscode/raw/refs/heads/main/assets/demo.gif)

## What is OneTimeSecret?

OneTimeSecret is a service that lets you share sensitive information with a link that automatically expires after being viewed once or after a set time period. This VS Code extension allows you to quickly create these secure, self-destructing links directly from your editor.

## Features

- **Secure Sharing**: Selected code is encrypted and only viewable once
- **Multiple Regions**: Choose between EU or US-based servers
- **Flexible Expiration**: Set links to expire after 1 hour, 1 day, or 7 days
- **Passphrase Protection**: Optionally secure your shared snippets with a passphrase
- **Context Menu Integration**: Right-click on selected text to quickly share
- **Command Palette Access**: Access all sharing options via Command Palette (⇧⌘P)

### How It Works

1. Select the code/text you want to share
2. Right-click and choose "OneTimeSecret: share selected text" or use Command Palette
3. Optionally enter a passphrase
4. Get a one-time link that you can share with anyone

## Available Commands

This extension provides the following commands:

| Command                                                              | Description                                     |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| `OneTimeSecret: share selected text. (EU Region; expires in 7 days)` | Share text on EU servers with 7-day expiration  |
| `OneTimeSecret: share selected text. (EU Region; expires in 1 day)`  | Share text on EU servers with 1-day expiration  |
| `OneTimeSecret: share selected text. (EU Region; expires in 1 hour)` | Share text on EU servers with 1-hour expiration |
| `OneTimeSecret: share selected text. (US Region; expires in 7 days)` | Share text on US servers with 7-day expiration  |
| `OneTimeSecret: share selected text. (US Region; expires in 1 day)`  | Share text on US servers with 1-day expiration  |
| `OneTimeSecret: share selected text. (US Region; expires in 1 hour)` | Share text on US servers with 1-hour expiration |

## Security

- Your selection is encrypted by the OneTimeSecret service
- Links automatically expire after being viewed once
- Optional passphrase protection adds another layer of security
- Secrets automatically expire even if they're never viewed

## Requirements

- Internet connection to connect to OneTimeSecret API servers
- VS Code version 1.100.0 or higher

## Privacy Considerations

This extension sends your selected text to the OneTimeSecret API. The text is encrypted on their servers, but you should review their [privacy policy](https://onetimesecret.com/privacy) for complete information about how your data is handled.

## Known Issues

- The extension requires an active internet connection
- Very large text selections may be rejected by the API

## Release Notes

### 0.0.1 (May 2025)

- Initial release
- Support for EU and US regions
- Multiple expiration options (1 hour, 1 day, 7 days)
- Optional passphrase protection

## About OneTimeSecret

This extension integrates with the OneTimeSecret service, which is operated by [Solutious Inc](https://solutious.com/). This extension is not officially affiliated with Solutious Inc.

Visit [onetimesecret.com](https://onetimesecret.com/) for more information about the service.

## License

This extension is licensed under the MIT License.

---

**Enjoy sharing your code securely!**
