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
        let logo = await fs_1.promises.readFile(path.join(__dirname, "..", `template/logo.txt`));
        this.log(logo.toString(), "\n");
        this.log("Creating a new Spotfire Mods project");
        this.log("If you don't know what options to chose accept the default ones.");
        this.log("");
        let answers = await inquirer.prompt([
            {
                type: "input",
                name: "folder",
                message: "Project folder name: ",
                default: "new-spofire-mod",
            },
            {
                type: "input",
                name: "modName",
                message: "Mode name: ",
                default: "new-spofire-mod",
            },
            {
                type: "input",
                name: "modId",
                message: "Mode id: ",
                default: "new-spofire-mod",
            },
            {
                type: "input",
                name: "modVersion",
                validate: (i) => { return /^[0-9]+(\.[0-9]+)*$/.test(i) ? true : "Version should be of form x.x... (e.g. 1.1.2)"; },
                message: "Mod version: ",
                default: "1.0",
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
                    { name: "1.3 - Spotfire 11.5", value: "1.3" },
                ],
            },
            {
                type: "confirm",
                name: "typeScript",
                message: "Use TypeScript (bundle with Webpack)",
                default: false,
            },
            {
                type: "confirm",
                name: "devServer",
                message: "Use Spotfire Mods dev server",
                default: true,
            },
            {
                type: "confirm",
                name: "vsCode",
                message: "Enable VS Code compatibility:",
                default: true,
            },
        ]);
        let projectType = `${answers.typeScript ? "ts" : "js"}`;
        let files = answers.typeScript ?
            ["index.html", "main.css", "bundle.js"] :
            ["index.html", "main.css", "main.js"];
        await fs_1.promises.mkdir(answers.folder);
        await fs_1.promises.mkdir(`${answers.folder}/src`);
        await fs_1.promises.mkdir(`${answers.folder}/spotfire`);
        if (answers.typeScript) {
            await fs_1.promises.mkdir(`${answers.folder}/static`);
        }
        //------------------------
        // Add API type definitions 
        //------------------------
        let sourceApiPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/spotfire-api-${answers.apiVersion.replace(".", "-")}.d.ts`);
        let destinatioApiPath = `${answers.folder}/spotfire/spotfire-api-${answers.apiVersion.replace(".", "-")}.d.ts`;
        await fs_1.promises.copyFile(sourceApiPath, destinatioApiPath);
        //------------------------
        // Add mod schema
        //------------------------
        let sourceSchemaPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-schema.json`);
        let destinationSchemaPath = `${answers.folder}/spotfire/mod-schema.json`;
        await fs_1.promises.copyFile(sourceSchemaPath, destinationSchemaPath);
        //------------------------
        // Add the source files
        //------------------------
        let sourceSrcPath = path.join(__dirname, "..", `template/${projectType}/src/`);
        let destinationSrcPath = `${answers.folder}/src/`;
        await fs.copy(sourceSrcPath, destinationSrcPath);
        if (answers.typeScript) {
            let sourceStaticPath = path.join(__dirname, "..", `template/${projectType}/static/`);
            let destinationStaticPath = `${answers.folder}/static/`;
            await fs.copy(sourceStaticPath, destinationStaticPath);
        }
        //------------------------
        // Add the mod manifest
        //------------------------
        let sourceManifestPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-manifest.json`);
        let destinationManifestPath = `${answers.folder}/${answers.typeScript ? 'static/' : 'src/'}mod-manifest.json`;
        let manifest = await fs_1.promises.readFile(sourceManifestPath);
        let manifestJson = JSON.parse(manifest.toString());
        manifestJson.apiVersion = answers.apiVersion;
        manifestJson.name = answers.modName;
        manifestJson.id = answers.modId;
        manifestJson.version = answers.modVersion;
        manifestJson.files = files;
        await fs_1.promises.writeFile(destinationManifestPath, JSON.stringify(manifestJson, null, "\t"));
        //------------------------
        // Add the vscode files
        //------------------------
        if (answers.vsCode) {
            let sourceVSCodePath = path.join(__dirname, "..", `template/vscode`);
            let destinationVSCodePath = `${answers.folder}/.vscode/`;
            await fs_1.promises.mkdir(`${answers.folder}/.vscode`);
            await fs.copy(sourceVSCodePath, destinationVSCodePath);
        }
        //----------------------------
        // Add the package.json file
        //----------------------------
        let sourcePackagePath = path.join(__dirname, "..", `template/${projectType}/package.json`);
        let destinationPackagePath = `${answers.folder}/package.json`;
        let packageFile = await fs_1.promises.readFile(sourcePackagePath);
        let packageJson = JSON.parse(packageFile.toString());
        packageJson.name = answers.modName;
        if (!answers.devServer) {
            packageJson.scripts.start = "npm install";
            delete packageJson.scripts.server;
            delete packageJson.devDependencies["@tibco/spotfire-mods-dev-server"];
        }
        await fs_1.promises.writeFile(destinationPackagePath, JSON.stringify(packageJson, null, "\t"));
        //-------------------------
        // Add the tsconfig file
        //-------------------------
        let sourceTSConfigPath = path.join(__dirname, "..", `template/${projectType}/tsconfig.json`);
        let destinationTSConfigPath = `${answers.folder}/tsconfig.json`;
        let tsFile = await fs_1.promises.readFile(sourceTSConfigPath);
        let tsJson = JSON.parse(tsFile.toString());
        // Edit file here
        await fs_1.promises.writeFile(destinationTSConfigPath, JSON.stringify(tsJson, null, "\t"));
        //-------------------------
        // Add the webpack.config file for typescript projects 
        //-------------------------
        if (answers.typeScript) {
            let sourceWebpackPath = path.join(__dirname, "..", `template/${projectType}/webpack.config.js`);
            let destinationWebpackPath = `${answers.folder}/webpack.config.js`;
            let wpFile = await fs_1.promises.readFile(sourceWebpackPath);
            let wpText = wpFile.toString();
            // Edit file here 
            await fs_1.promises.writeFile(destinationWebpackPath, wpText);
        }
        console.log("Installing packages...");
        //-------------------------
        // Install packages
        //-------------------------
        let exec = util.promisify(child.exec);
        await exec("npm install", { cwd: `${answers.folder}` });
        console.log("Project created.");
    }
}
exports.default = Init;
Init.description = "Initialize a new Spotfire Mods project";
