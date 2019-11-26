export function resolveEnvironmentVariables(text: string, isWindows: boolean): string {
    if (isWindows) {
        return text.replace(/%([^%]+)%/g, (_, name: string) => {
            const resolved = process.env[name];
            return resolved ?? name;
        });
    }
    return text.replace(/(\$[a-zA-Z_]+[a-zA-Z0-9_]*)/g, (_, name: string) => {
        const resolved = process.env[name.substr(1)];
        return resolved ?? name;
    });
}