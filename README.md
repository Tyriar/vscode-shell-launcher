# Shell Launcher

⚠️ *This extension is now deprecated in favor of the builtin terminal profiles feature that landed in v1.55. Read more about it in the [release notes](https://code.visualstudio.com/updates/v1_55#_terminal-profiles). If you rely on features from this extension that aren't in profiles please create an issue against the [microsoft/vscode repo](https://github.com/microsoft/vscode/issues).*

[![Build Status](https://tyriar.visualstudio.com/vscode-shell-launcher/_apis/build/status/Tyriar.vscode-shell-launcher?branchName=master)](https://tyriar.visualstudio.com/vscode-shell-launcher/_build/latest?definitionId=3?branchName=master)

Easily launch multiple shell configurations in the terminal.

![Shell launcher in action](images/quick-pick.png)

## Commands

This extension exposes the following commands that can be keybound in your [keybindings.json](https://code.visualstudio.com/docs/customization/keybindings#_customizing-shortcuts) file:

- `shellLauncher.launch`: Display a quick pick that allows selecting of one of the configured terminal shells.

## Configuration
Do the following to bind the Shell Launcher command to CTRL+SHIFT+T.

1\. Open VS Code and hit CTRL+SHIFT+T, that will open keybindings.json. You can choose another key combination if you have already assigned CTRL+SHIFT+T to another command.

2\. Enter the following code to they keybindings.json file.

```javascript
[{
    "key": "ctrl+shift+t",
    "command": "shellLauncher.launch"
}]
```

3\. Save keybindings.json, hit CTRL+SHIFT+T and the Shell Launcher will open.

## Settings

All shells can be user configured in your [settings.json](https://code.visualstudio.com/docs/customization/userandworkspace) file, there is a different key for each platform:

- `shellLauncher.shells.linux`: For Linux
- `shellLauncher.shells.osx`: For macOS
- `shellLauncher.shells.windows`: For Window

When creating a shell configuration, the path to the executable must be defined. Other values are optional and will cause changes in the way the UI elements are presented. 

- shell: Path to the executable that launches the shell
- args: (Optional) An array of arguments to be passed to the shell on startup
- label: (Optional) Displayed in the shellLauncher dropdown menu
- launchName: (Optional) Displayed in the terminal dropdown menu, note that this is static and replaces the default terminal name that changes based on the program being run
- cwd: (Optional) A path for the current working directory to be used for the terminal
- env: (Optional) Environment variables to be set for the terminal

Here is an example shell which will launch `bash` as a login shell (`bash -l`) on Linux:

```json
{
  "shellLauncher.shells.linux": [
    {
      "shell": "bash",
      "args": ["-l"],
      "label": "bash login shell"
    }
  ]
}
```
