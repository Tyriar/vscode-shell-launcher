'use strict';

import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { resolveEnvironmentVariables } from './environment';

interface ShellConfig {
    shell: string;
    args?: string[];
    label?: string;
    launchName?: string;
    cwd?: string;
    env?: { [key: string]: string | null; };
}

interface ShellLauncherConfig {
    shells: {
        linux: ShellConfig[];
        osx: ShellConfig[];
        windows: ShellConfig[];
    };
}

interface ShellQuickPickItem extends vscode.QuickPickItem {
    _shell: ShellConfig;
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

function resolveShellVariables(shellConfig: ShellConfig): void {
    const isWindows = os.platform() === 'win32';
    shellConfig.shell = resolveEnvironmentVariables(shellConfig.shell, isWindows);
    if (shellConfig.args) {
        shellConfig.args.forEach((arg, i) => {
            shellConfig.args[i] = resolveEnvironmentVariables(arg, isWindows);
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('shellLauncher.launch', () => {
        const shells = getShells();
        shells.forEach(s => resolveShellVariables(s));
        const options: vscode.QuickPickOptions = {
            placeHolder: 'Select the shell to launch'
        }
        const items: ShellQuickPickItem[] = shells.filter(s => {
            // If the basename is the same assume it's being pulled from the PATH
            if (path.basename(s.shell) === s.shell) {
                return true;
            } 
            // Only show the shell if the path exists
            try {
                // Sysnative virtual folder to access 64bit system System32 on 32bit vscode
                if (os.platform() === 'win32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                    s.shell = s.shell.replace('System32', 'Sysnative');
                }
                fs.accessSync(s.shell, fs.constants.R_OK | fs.constants.X_OK);
            } catch {
                return false;
            }
            return true;
        }).map(s => {
            return {
                label: getShellLabel(s),
                description: getShellDescription(s),
                _shell: s
            };
        });
        vscode.window.showQuickPick(items, options).then(item => {
            if (!item) {
                return;
            }
            const shell = item._shell;
            const terminalOptions: vscode.TerminalOptions = {
                cwd: shell.cwd,
                name: shell.launchName,
                shellPath: shell.shell,
                shellArgs: shell.args,
                env: shell.env
            };
            const terminal = vscode.window.createTerminal(terminalOptions);
            terminal.show();
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
