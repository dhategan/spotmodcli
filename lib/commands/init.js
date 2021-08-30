"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const fs_1 = require("fs");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const child = require("child_process");
const util = require("util");
class Init extends command_1.Command {
    async run() {
        this.log("Creating a new Spotfire Mods porject");
        this.log("If you don't know what options to chose accept the default ones.");
        this.log("");
        let answers = await inquirer.prompt([
            {
                type: "input",
                name: "folder",
                message: "Project folder name: ",
                default: 'new-spofire-mod'
            },
            {
                type: "input",
                name: "modName",
                message: "Mode name: ",
                default: 'new-spofire-mod'
            },
            {
                type: "list",
                name: "apiVersion",
                message: "API Version: ",
                default: "1.3",
                choices: [
                    { name: "1.0 - Spotfire 11.0", value: "1.0" },
                    { name: "1.1 - Spotfire 11.3", value: "1.1" },
                    { name: "1.2 - Spotfire 11.4", value: "1.2" },
                    { name: "1.3 - Spotfire 11.5", value: "1.3" }
                ]
            },
            {
                type: "confirm",
                name: "typeScript",
                message: "Use TypeScript",
                default: false
            },
            {
                type: "confirm",
                name: "devServer",
                message: "Use Spotfire Mods dev server",
                default: true
            },
            {
                type: "confirm",
                name: "vsCode",
                message: "Enable VS Code compatibility:",
                default: true
            },
        ]);
        //console.log(answers);
        await fs_1.promises.mkdir(answers.folder);
        await fs_1.promises.mkdir(`${answers.folder}/src`);
        await fs_1.promises.mkdir(`${answers.folder}/spotfire`);
        // Add API type definitions
        let sourceApiPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/spotfire-api-${answers.apiVersion.replace('.', '-')}.d.ts`);
        let destinatioApiPath = `${answers.folder}/spotfire/spotfire-api-${answers.apiVersion.replace('.', '-')}.d.ts`;
        await fs_1.promises.copyFile(sourceApiPath, destinatioApiPath);
        // Add mod schema
        let sourceSchemaPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-schema.json`);
        let destinationSchemaPath = `${answers.folder}/spotfire/mod-schema.json`;
        await fs_1.promises.copyFile(sourceSchemaPath, destinationSchemaPath);
        // Add the source files 
        let sourceSrcPath = path.join(__dirname, "..", `template/src/`);
        let destinationSrcPath = `${answers.folder}/src/`;
        await fs.copy(sourceSrcPath, destinationSrcPath);
        // Add the mod manifest
        let sourceManifestPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-manifest.json`);
        let destinationManifestPath = `${answers.folder}/src/mod-manifest.json`;
        let manifest = await fs_1.promises.readFile(sourceManifestPath);
        let manifestJson = JSON.parse(manifest.toString());
        manifestJson.apiVersion = answers.apiVersion;
        manifestJson.name = answers.modName;
        await fs_1.promises.writeFile(destinationManifestPath, JSON.stringify(manifestJson, null, '\t'));
        // Add the vscode files 
        if (answers.vsCode) {
            let sourceVSCodePath = path.join(__dirname, "..", `template/vscode`);
            let destinationVSCodePath = `${answers.folder}/.vscode/`;
            await fs_1.promises.mkdir(`${answers.folder}/.vscode`);
            await fs.copy(sourceVSCodePath, destinationVSCodePath);
        }
        // Add the package.json file
        let sourcePackagePath = path.join(__dirname, "..", `template/package.json`);
        let destinationPackagePath = `${answers.folder}/package.json`;
        let packageFile = await fs_1.promises.readFile(sourcePackagePath);
        let packageJson = JSON.parse(packageFile.toString());
        packageJson.name = answers.modName;
        if (!answers.devServer) {
            packageJson.scripts.start = "npm install";
            delete packageJson.scripts.server;
            delete packageJson.devDependencies["@tibco/spotfire-mods-dev-server"];
        }
        await fs_1.promises.writeFile(destinationPackagePath, JSON.stringify(packageJson, null, '\t'));
        // Add the tsconfig file
        if (answers.typeScript) {
            let sourceTSConfigPath = path.join(__dirname, "..", `template/tsconfig.json`);
            let destinationTSConfigPath = `${answers.folder}/tsconfig.json`;
            let tsFile = await fs_1.promises.readFile(sourceTSConfigPath);
            let tsJson = JSON.parse(tsFile.toString());
            await fs_1.promises.writeFile(destinationTSConfigPath, JSON.stringify(tsJson, null, '\t'));
        }
        console.log("Installing packages...");
        let exec = util.promisify(child.exec);
        await exec("npm install", { cwd: `${answers.folder}` });
        console.log("Project created.");
    }
}
exports.default = Init;
Init.description = 'Initialize a new Spotfire Mods project';
