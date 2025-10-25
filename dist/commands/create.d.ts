interface CreateOptions {
    description?: string;
    template?: string;
    templateType?: string;
    walletProvider?: string;
    contracts?: string;
    skipInstall?: boolean;
    yes?: boolean;
    miniappName?: string;
    miniappDescription?: string;
    miniappTags?: string;
    miniappTagline?: string;
}
export declare function createCommand(projectName?: string, options?: CreateOptions): Promise<void>;
export {};
//# sourceMappingURL=create.d.ts.map