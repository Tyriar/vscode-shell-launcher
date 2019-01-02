export function resolveEnvironmentVariables(text: string, isWindows: boolean): string {
    if (isWindows) {
        return text.replace(/%([^%]+)%/g, (_, name: string) => process.env[name]);
    }
    return text.replace(/(\$[a-zA-Z_]+[a-zA-Z0-9_]*)/g, (_, name: string) => process.env[name.substr(1)]);
}