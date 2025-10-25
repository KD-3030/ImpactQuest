import { NodePlopAPI } from "plop";
import path from "path";
import { getTemplatesPath } from "./utils/paths.js";

interface PlopData {
  projectName: string;
  description: string;
  walletProvider: string;
  contractFramework: string;
  templateType: string;
  installDependencies: boolean;
}

export default function (plop: NodePlopAPI): void {
  // Set the base path for templates
  plop.setDefaultInclude({ generators: true });
  
  // Get templates path using ESM-compatible method
  const templatesPath = getTemplatesPath(import.meta.url);

  // Configure the Celo project generator
  plop.setGenerator("celo-project", {
    description: "Generate a new Celo blockchain project",
    prompts: [
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        validate: (input: string): string | boolean => {
          if (!input || input.trim().length === 0) {
            return "Project name is required";
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(input.trim())) {
            return "Project name can only contain letters, numbers, hyphens, and underscores";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Project description:",
        default: "A new Celo blockchain project",
      },
    ],
    actions: [
      // Copy all template files from base template
      {
        type: "addMany",
        destination: "{{projectPath}}/",
        base: path.join(templatesPath, "base/"),
        templateFiles: path.join(templatesPath, "base/**/*.hbs"),
        globOptions: {
          dot: true,
        },
        verbose: true,
      },
      // Copy all static assets (images, etc.)
      {
        type: "addMany",
        destination: "{{projectPath}}/",
        base: path.join(templatesPath, "base/"),
        templateFiles: [path.join(templatesPath, "base/**/*"), "!" + path.join(templatesPath, "base/**/*.hbs")],
        globOptions: {
          dot: true,
        },
        verbose: true,
      },
      // Conditionally add RainbowKit wallet components
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/src/components/",
        base: path.join(templatesPath, "wallets/rainbowkit/components/"),
        templateFiles: path.join(templatesPath, "wallets/rainbowkit/components/*.tsx.hbs"),
        skip: (data: PlopData): string | false => {
          if (
            data.templateType === "farcaster-miniapp" ||
            data.templateType === "minipay"
          ) {
            return "Skipping RainbowKit - This template uses its own wallet components";
          }
          if (data.walletProvider !== "rainbowkit") {
            return "Skipping RainbowKit - different wallet provider selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Minipay wallet components
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/src/components/",
        base: path.join(templatesPath, "minipay/components/"),
        templateFiles: [
          path.join(templatesPath, "minipay/components/connect-button.tsx.hbs"),
          path.join(templatesPath, "minipay/components/wallet-provider.tsx.hbs"),
          path.join(templatesPath, "minipay/components/user-balance.tsx.hbs"),
        ],
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "minipay") {
            return "Skipping Minipay wallet components - different template selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Minipay tailwind config
      {
        type: "add",
        path: "{{projectPath}}/apps/web/tailwind.config.js",
        templateFile: path.join(templatesPath, "minipay/tailwind.config.js.hbs"),
        force: true, // Overwrite the base tailwind config
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "minipay") {
            return "Skipping Minipay tailwind config - different template selected";
          }
          return false;
        },
      },
      // Conditionally add Thirdweb wallet components
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/src/components/",
        base: path.join(templatesPath, "wallets/thirdweb/components/"),
        templateFiles: path.join(templatesPath, "wallets/thirdweb/components/*.tsx.hbs"),
        skip: (data: PlopData): string | false => {
          if (data.templateType === "farcaster-miniapp") {
            return "Skipping Thirdweb - Farcaster Miniapp uses its own wallet components";
          }
          if (data.walletProvider !== "thirdweb") {
            return "Skipping Thirdweb - different wallet provider selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Thirdweb wallet lib
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/src/lib/",
        base: path.join(templatesPath, "wallets/thirdweb/lib/"),
        templateFiles: path.join(templatesPath, "wallets/thirdweb/lib/*.ts.hbs"),
        skip: (data: PlopData): string | false => {
          if (data.templateType === "farcaster-miniapp") {
            return "Skipping Thirdweb lib - Farcaster Miniapp uses its own wallet components";
          }
          if (data.walletProvider !== "thirdweb") {
            return "Skipping Thirdweb lib - different wallet provider selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Hardhat smart contract development
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/contracts/",
        base: path.join(templatesPath, "contracts/hardhat/"),
        templateFiles: path.join(templatesPath, "contracts/hardhat/**/*.hbs"),
        globOptions: {
          dot: true,
        },
        skip: (data: PlopData): string | false => {
          if (data.contractFramework !== "hardhat") {
            return "Skipping Hardhat - different contract framework selected";
          }
          return false;
        },
        verbose: true,
      },

      // Conditionally add Foundry smart contract development
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/contracts/",
        base: path.join(templatesPath, "contracts/foundry/"),
        templateFiles: path.join(templatesPath, "contracts/foundry/**/*.hbs"),
        globOptions: {
          dot: true,
        },
        skip: (data: PlopData): string | false => {
          if (data.contractFramework !== "foundry") {
            return "Skipping Foundry - different contract framework selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Farcaster Miniapp template files
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/src/",
        base: path.join(templatesPath, "farcaster-miniapp/apps/web/src/"),
        templateFiles: path.join(templatesPath, "farcaster-miniapp/apps/web/src/**/*.hbs"),
        globOptions: {
          dot: true,
        },
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "farcaster-miniapp") {
            return "Skipping Farcaster Miniapp - different template type selected";
          }
          return false;
        },
        verbose: true,
      },
      // Conditionally add Farcaster Miniapp configuration files
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/",
        base: path.join(templatesPath, "farcaster-miniapp/apps/web/"),
        templateFiles: [
          path.join(templatesPath, "farcaster-miniapp/apps/web/.eslintrc.json.hbs")
        ],
        globOptions: {
          dot: true,
        },
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "farcaster-miniapp") {
            return "Skipping Farcaster Miniapp config - different template type selected";
          }
          return false;
        },
        verbose: true,
      },
      // Add Farcaster setup documentation
      {
        type: "add",
        path: "{{projectPath}}/FARCASTER_SETUP.md",
        templateFile: path.join(templatesPath, "farcaster-miniapp/FARCASTER_SETUP.md.hbs"),
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "farcaster-miniapp") {
            return "Skipping Farcaster setup guide - different template type selected";
          }
          return false;
        },
      },
      // Copy Farcaster Miniapp static assets (images, etc.)
      {
        type: "addMany",
        destination: "{{projectPath}}/apps/web/public/",
        base: path.join(templatesPath, "farcaster-miniapp/apps/web/public/"),
        templateFiles: [
          path.join(templatesPath, "farcaster-miniapp/apps/web/public/*"),
          "!" + path.join(templatesPath, "farcaster-miniapp/apps/web/public/**/*.hbs")
        ],
        globOptions: {
          dot: true,
        },
        skip: (data: PlopData): string | false => {
          if (data.templateType !== "farcaster-miniapp") {
            return "Skipping Farcaster Miniapp assets - different template type selected";
          }
          return false;
        },
        verbose: true,
      },
    ],
  });

  // Add helper functions for templates
  plop.setHelper("kebabCase", (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/\s+/g, "-")
      .toLowerCase();
  });

  plop.setHelper("camelCase", (text: string) => {
    return text
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (_, c) => c.toLowerCase());
  });

  plop.setHelper("pascalCase", (text: string) => {
    return text
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  });

  // Helper to check if wallet provider equals a value
  plop.setHelper("eq", (a: unknown, b: unknown): boolean => a === b);

  // Helper for logical OR operations
  plop.setHelper("or", (...args: unknown[]): boolean => {
    // Remove the last argument which is the Handlebars options object
    const values = args.slice(0, -1);
    return values.some(value => !!value);
  });
}
