"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const fs_1 = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const glob = require("glob");
class Update extends command_1.Command {
    async run() {
        const { args } = this.parse(Update);
        this.log(Update.description);
        let confirm = await inquirer.prompt([
            {
                type: "confirm",
                name: "continue",
                message: `This will permanetly alter some of your project's files. 
  It's advisable to make a back-up before proceeding. 
  Are you sure you want to continue? `,
                default: true
            }
        ]);
        if (!confirm.continue) {
            return;
        }
        let dirPath = path.normalize(process.cwd() + "/" + args.path).toString();
        //-------------------------------------
        // Update the manifest file
        //-------------------------------------
        let manifestPath = glob.sync(dirPath + "/**/mod-manifest.json");
        if (manifestPath.length === 0) {
            console.log(`There is no mod-manifest.json in ${dirPath}`);
            return;
        }
        if (manifestPath.length > 1) {
            manifestPath = await inquirer.prompt([
                {
                    type: "list",
                    name: "manifestPath",
                    message: `Multiple mod-manifest.json files found.Which one to update? `,
                    default: 0,
                    choices: manifestPath.map(p => { return { name: p, value: p }; })
                }
            ]).then(a => [a.manifestPath]);
        }
        let manifest = await fs_1.promises.readFile(manifestPath[0]);
        let manifestJson = JSON.parse(manifest.toString());
        let answers = await inquirer.prompt([
            {
                type: "list",
                name: "apiVersion",
                message: `Chose new API version. (current is ${manifestJson.apiVersion})`,
                default: "1.3",
                choices: [
                    { name: "1.0 - Spotfire 11.0", value: "1.0" },
                    { name: "1.1 - Spotfire 11.3", value: "1.1" },
                    { name: "1.2 - Spotfire 11.4", value: "1.2" },
                    { name: "1.3 - Spotfire 11.5", value: "1.3" },
                ],
            }
        ]);
        manifestJson.apiVersion = answers.apiVersion;
        await fs_1.promises.writeFile(manifestPath[0], JSON.stringify(manifestJson, null, "\t"));
        //---------------------------
        // Replace API type definitions 
        //---------------------------
        let apiPath = glob.sync(dirPath + "/**/spotfire-api*.d.ts");
        if (apiPath.length === 0) {
            console.log("No API type definsions found.");
            return;
        }
        let sourceApiPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/spotfire-api-${answers.apiVersion.replace(".", "-")}.d.ts`);
        let destinationApiPath = path.parse(apiPath[0]).dir + `/spotfire-api-${answers.apiVersion.replace(".", "-")}.d.ts`;
        await fs_1.promises.copyFile(sourceApiPath, destinationApiPath);
        if (apiPath[0] !== destinationApiPath) {
            await fs_1.promises.rm(apiPath[0]);
        }
        //------------------------
        // Replace mod schema
        //------------------------
        let schemaPath = glob.sync(dirPath + "/**/mod-schema.json");
        if (schemaPath.length === 0) {
            console.log("No mod-shema.json found.");
            return;
        }
        let sourceSchemaPath = path.join(__dirname, "..", `template/spotfire/${answers.apiVersion}/mod-schema.json`);
        let destinationSchemaPath = path.parse(schemaPath[0]).dir + `/mod-schema.json`;
        await fs_1.promises.copyFile(sourceSchemaPath, destinationSchemaPath);
        console.log(`Project was updated to API version ${answers.apiVersion}.`);
    }
}
exports.default = Update;
Update.description = `
  Update a Spotfire Mods project to another API version.
  This will only update the API type defintions, the mod schema file, and the API version in the mod manifest file.
  After this it might be necesary to revise the mod source code so that it's aligned with the new api version.  
  `;
Update.args = [
    { name: 'path' }
];
