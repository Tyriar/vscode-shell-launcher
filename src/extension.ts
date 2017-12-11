'use strict';

import * as os from 'os';
import * as vscode from 'vscode';

interface ShellConfig {
    shell: string;
    args?: string[];
    label?: string;
}

interface ShellLauncherConfig {
    shells: {
        linux: ShellConfig[];
        osx: ShellConfig[];
        windows: ShellConfig[];
    };
}

function getShells(): ShellConfig[] {
    const config = <ShellLauncherConfig>vscode.workspace.getConfiguration().get('shellLauncher');
    const shells = config.shells;
    if (os.platform() === 'win32') {
        return shells.windows;
    }
    if (os.platform() === 'darwin') {
        return shells.osx;
    }
    return shells.linux;
}

function getShellLabel(shell: ShellConfig) {
    if (shell.label) {
        return shell.label;
    }
    return getShellDescription(shell);
}

function getShellDescription(shell: ShellConfig) {
    if (!shell.args || shell.args.length === 0) {
        return shell.shell;
    }
    return `${shell.shell} ${shell.args.join(' ')}`;
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('shellLauncher.launch', () => {
        const shells = getShells();
        const options: vscode.QuickPickOptions = {
            placeHolder: 'Select the shell to launch'
        }
        const items: vscode.QuickPickItem[] = shells.map(s => {
            return {
                label: getShellLabel(s),
                description: getShellDescription(s)
            };
        });
        vscode.window.showQuickPick(items, options).then(item => {
            if (!item) {
                return;
            }
            const shell = shells.filter(c => getShellLabel(c) === item.label)[0];
            const terminal = vscode.window.createTerminal(undefined, shell.shell, shell.args);
            terminal.show();
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
