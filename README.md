# Infostacker Note Publish Plugin Documentation

## Overview

The Infostacker Note Publish plugin enables users to send notes to a server, edit them, and delete them directly within the Obsidian program. Additionally, it allows users to share notes with others via a generated link. The plugin supports attachments, and users with the link can view the note along with its attachments in HTML format.

## Installation

### Prerequisites

- [Obsidian](https://obsidian.md/) installed on your system.
- Access to your Obsidian vault.

### Steps

1. Download the repository of the plugin.
2. Open Obsidian.
3. Open or create a vault where you want to install the plugin.
4. Navigate to Settings and select "Community Plugins".
5. Enable "Turn on community plugins".
6. Go to the local path of your Obsidian vault (e.g., TesterVault/.obsidian).
7. If it doesn't exist, create a folder named "plugins" and enter it.
8. Copy the downloaded plugin folder and paste it into the "plugins" folder.
9. Open the folder containing the plugin files using a code editor (Visual Studio Code is recommended).
10. In `infostacker.ts`, modify the `baseUrl` (line 4) to the URL of the server that will receive requests.
11. Open the terminal and run `npm install` in the root directory of the plugin (where this readme is located).
12. After successful installation, run `npm run dev` in the terminal.
13. Switch back to Obsidian, press `Ctrl+P`, and type "reload".
14. Select "Reload app without saving".
15. Open the Settings again and go to the "Community plugins" tab.
16. In the "Installed plugins" section, "Infostacker Note Publish" should appear. Enable it using the radio button.

## Usage

### Publishing a Note

1. Write or open the note you want to publish.
2. Use the plugin interface to send the note to the server.
![Menu interface: ](media/file-menu-publish.jpg)
3. Once published, a link will be generated for sharing.

### Editing a Note

1. Open the published note in Obsidian.
2. Make the necessary edits.
3. Use the plugin interface to update the note on the server.
![Menu interface: ](media/file-menu-update.jpg)

### Deleting a Note

1. Open the published note in Obsidian.
2. Use the plugin interface to delete the note from the server.
![Menu interface: ](media/file-menu-remove.jpg)

### Sharing a Note

1. Copy the generated link from the plugin interface.
![Menu interface: ](media/file-menu-copy-url.jpg)
2. Share the link with others.
3. Recipients can view the note and its attachments in HTML format using the provided link.

## Configuration

- `baseUrl`: Specify the URL of the server where requests will be sent. Ensure this is correctly configured for the plugin to function properly.

## Troubleshooting

If you encounter any issues during installation or usage, refer to the plugin's documentation or reach out to the plugin developer for assistance.

---

This documentation provides a comprehensive guide to installing, configuring, and using the Infostacker Note Publish plugin. If you have any further questions or require additional support, feel free to consult the plugin documentation or contact the plugin developer.
