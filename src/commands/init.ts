import { Command, flags } from '@oclif/command'
import { string } from '@oclif/command/lib/flags';
import { promises as fsp } from 'fs';
import * as fs from "fs-extra";
import * as path from 'path'
import * as inquirer from 'inquirer';
import { template } from '@oclif/plugin-help/lib/util';
import * as child from 'child_process';
import * as util from 'util'


export default class Init extends Command {
    static description = 'Initialize a new Spotfire Mods project'

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

        ])

        console.log(answers);

        await fsp.mkdir(answers.folder);
        await fsp.mkdir(`${answers.folder}/src`);
        await fsp.mkdir(`${answers.folder}/spotfire`);

        // Add API type definitions
        let sourceApiPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/spotfire-api-${answers.apiVersion.replace('.', '-')}.d.ts`);
        let destinatioApiPath = `${answers.folder}/spotfire/spotfire-api-${answers.apiVersion.replace('.', '-')}.d.ts`
        await fsp.copyFile(sourceApiPath, destinatioApiPath);

        // Add mod schema
        let sourceSchemaPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-schema.json`);
        let destinationSchemaPath = `${answers.folder}/spotfire/mod-schema.json`;
        await fsp.copyFile(sourceSchemaPath, destinationSchemaPath);

        // Add the source files 
        let sourceSrcPath = path.join(__dirname, "..", `template/src/`);
        let destinationSrcPath = `${answers.folder}/src/`
        await fs.copy(sourceSrcPath, destinationSrcPath);

        // Add the mod manifest
        let sourceManifestPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-manifest.json`);
        let destinationManifestPath = `${answers.folder}/src/mod-manifest.json`;
        let manifest = await fsp.readFile(sourceManifestPath);
        let manifestJson = JSON.parse(manifest.toString());
        manifestJson.apiVersion = answers.apiVersion;
        manifestJson.name = answers.modName;
        await fsp.writeFile(destinationManifestPath, JSON.stringify(manifestJson));

        // Add the vscode files 
        if (answers.vsCode) {
            let sourceVSCodePath = path.join(__dirname, "..", `template/vscode`);
            let destinationVSCodePath = `${answers.folder}/.vscode/`
            await fsp.mkdir(`${answers.folder}/.vscode`);
            await fs.copy(sourceVSCodePath, destinationVSCodePath);
        }

        // Add the package.json file
        let sourcePackagePath = path.join(__dirname, "..", `template/package.json`);
        let destinationPackagePath = `${answers.folder}/package.json`;
        let packageFile = await fsp.readFile(sourcePackagePath);
        let packageJson = JSON.parse(packageFile.toString());

        packageJson.name = answers.modName;
        if(!answers.devServer) {
            packageJson.scripts.start = "npm install";
            delete packageJson.scripts.server;
            delete packageJson.devDependencies["@tibco/spotfire-mods-dev-server"]
        }

        await fsp.writeFile(destinationPackagePath, JSON.stringify(packageJson));

        console.log("Installing packages...");
        //let spawn  = util.promisify(child.spawn);
        //let s= await spawn("npm.cmd",["install"], {cwd:`${answers.folder}` });
        let exec  = util.promisify(child.exec);
        await exec("npm install", {cwd:`${answers.folder}` });

        console.log("Project created.")

    }
}