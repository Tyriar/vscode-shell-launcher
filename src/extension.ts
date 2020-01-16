import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { resolveEnvironmentVariables } from './environment';

interface IShellConfig {
    shell: string;
    args?: string[];
    label?: string;
    launchName?: string;
    cwd?: string;
    env?: { [key: string]: string | null; };
}

interface IShellLauncherConfig {
    shells: {
        linux: IShellConfig[];
        osx: IShellConfig[];
        windows: IShellConfig[];
    };
}

interface IShellQuickPickItem extends vscode.QuickPickItem {
    _shell: IShellConfig;
}

function getShells(): IShellConfig[] {
    const config = <IShellLauncherConfig>vscode.workspace.getConfiguration().get('shellLauncher');
    const shells = config.shells;
    if (os.platform() === 'win32') {
        return shells.windows;
    }
    if (os.platform() === 'darwin') {
        return shells.osx;
    }
    return shells.linux;
}

function getShellLabel(shell: IShellConfig): string {
    if (shell.label) {
        return shell.label;
    }
    return getShellDescription(shell);
}

function getShellDescription(shell: IShellConfig): string {
    if (!shell.args || shell.args.length === 0) {
        return shell.shell;
    }
    return `${shell.shell} ${shell.args.join(' ')}`;
}

function resolveShellVariables(shellConfig: IShellConfig): void {
    const isWindows = os.platform() === 'win32';
    shellConfig.shell = resolveEnvironmentVariables(shellConfig.shell, isWindows);
    if (shellConfig.args) {
        for (let i = 0; i < shellConfig.args.length; i++) {
            shellConfig.args[i] = resolveEnvironmentVariables(shellConfig.args[i], isWindows);
        }
    }
}

function startShell(shell: IShellConfig): void {
    const terminalOptions: vscode.TerminalOptions = {
        cwd: shell.cwd,
        name: shell.launchName,
        shellPath: shell.shell,
        shellArgs: shell.args,
        env: shell.env
    };
    const terminal = vscode.window.createTerminal(terminalOptions);
    terminal.show();
}

export function activate(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('shellLauncher.launch', () => {
        const shells = getShells();
        shells.forEach(s => resolveShellVariables(s));
        const options: vscode.QuickPickOptions = {
            placeHolder: 'Select the shell to launch'
        };
        const items: IShellQuickPickItem[] = shells.filter(s => {
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
        if (1 === items.length) {
            startShell(items[0]._shell);
        } else {
            vscode.window.showQuickPick(items, options).then(item => {
                if (item) {
                    startShell(item._shell);
                }
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate(): void { }
