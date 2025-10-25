export interface PlopConfig {
    projectName: string;
    description: string;
    templateType: string;
    walletProvider: string;
    contractFramework: string;
    projectPath: string;
    installDependencies?: boolean;
    miniappName?: string;
    miniappDescription?: string;
    miniappTags?: string;
    miniappTagline?: string;
}
/**
 * Professional template-driven project generator using Plop.js
 */
export declare class TemplateGenerator {
    /**
     * Generate a new Celo project using templates
     */
    generateProject(config: PlopConfig): Promise<void>;
}
/**
 * Run the Plop generator with the provided configuration
 */
export declare function runPlopGenerator(config: PlopConfig): Promise<void>;
//# sourceMappingURL=plop-generator.d.ts.map