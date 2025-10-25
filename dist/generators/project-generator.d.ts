import { Ora } from "ora";
export interface ProjectConfig {
    projectName: string;
    description: string;
    templateType: string;
    walletProvider: string;
    contractFramework: string;
    projectPath: string;
    installDependencies: boolean;
    spinner: Ora;
    miniappName?: string;
    miniappDescription?: string;
    miniappTags?: string;
    miniappTagline?: string;
}
export declare function generateProject(config: ProjectConfig): Promise<void>;
//# sourceMappingURL=project-generator.d.ts.map