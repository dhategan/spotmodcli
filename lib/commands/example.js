"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const fs_1 = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const glob = require("glob");
const got_1 = require("got");
const fs = require("fs-extra");
const child = require("child_process");
const util = require("util");
const jszip = require("jszip");
class Example extends command_1.Command {
    async extract(zipFile, outPath) {
        var _a;
        let contents = await jszip.loadAsync(zipFile);
        for (const filename of Object.keys(contents.files)) {
            // exclude the root folder
            let search = /^.*?(\/)(.*)/.exec(filename);
            if (search !== null) {
                //console.log(search[2]);
                let dest = outPath + "/" + search[2];
                let buff = await ((_a = contents.file(filename)) === null || _a === void 0 ? void 0 : _a.async("nodebuffer"));
                if (buff) {
                    await fs_1.promises.mkdir(path.parse(dest).dir, { recursive: true });
                    await fs_1.promises.writeFile(dest, buff);
                }
            }
        }
        ;
    }
    async removeFolder(folderPath) {
        await fs_1.promises.rm(folderPath, { force: true, recursive: true });
    }
    async run() {
        let gitExampleResponse = await got_1.default("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/examples").json();
        let gitProtoResponse = await got_1.default("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/prototypes").json();
        let gitCatalogResponse = await got_1.default("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/catalog").json();
        let listOfProjects = gitExampleResponse.concat(gitProtoResponse, gitCatalogResponse).filter((e) => e.type === "dir");
        if (listOfProjects === null || listOfProjects.length === 0) {
            this.log("Couldn't fetch the exampel list from github");
            return;
        }
        let logo = await fs_1.promises.readFile(path.join(__dirname, "..", `template/logo.txt`));
        this.log(logo.toString(), "\n");
        let exampleChoices = listOfProjects.map((e) => { return { name: e.name, value: e }; });
        let answers = await inquirer.prompt([
            {
                type: "rawlist",
                name: "exampleChoice",
                message: "Chose the example that will serve as template",
                default: "",
                choices: exampleChoices
            },
            {
                type: "input",
                name: "folder",
                message: "Project folder name: ",
                default: (a) => "new-" + a.exampleChoice.name,
            },
            {
                type: "input",
                name: "modName",
                message: "Mode name: ",
                default: (a) => "new-" + a.exampleChoice.name,
            },
            {
                type: "input",
                name: "modId",
                message: "Mode id: ",
                default: (a) => "new-" + a.exampleChoice.name,
            },
        ]);
        this.log("Fetching example");
        let examplesZip = await got_1.default('https://api.github.com/repos/tibcosoftware/spotfire-mods/zipball').buffer();
        let tempFolder = path.normalize(process.cwd() + `/temp`);
        await fs_1.promises.mkdir(answers.folder);
        await this.removeFolder(tempFolder);
        await fs_1.promises.mkdir(tempFolder);
        await this.extract(examplesZip, tempFolder);
        let exampleTempPath = path.normalize(tempFolder + "/" + answers.exampleChoice.path);
        await fs.copy(exampleTempPath, answers.folder);
        //------------------------
        // Add the mod manifest
        //------------------------
        let manifestPath = glob.sync(answers.folder + "/**/mod-manifest.json");
        if (manifestPath.length === 0) {
            console.log(`There is no mod-manifest.json in ${answers.folder}`);
            return;
        }
        if (manifestPath.length > 1) {
            manifestPath = await inquirer.prompt([
                {
                    type: "list",
                    name: "manifestPath",
                    message: `Multiple mod-manifest.json files found. Which one to update? `,
                    default: 0,
                    choices: manifestPath.map(p => { return { name: p, value: p }; })
                }
            ]).then(a => [a.manifestPath]);
        }
        let manifest = await fs_1.promises.readFile(manifestPath[0]);
        let manifestJson = JSON.parse(manifest.toString());
        manifestJson.name = answers.modName;
        manifestJson.id = answers.modId;
        await fs_1.promises.writeFile(manifestPath[0], JSON.stringify(manifestJson, null, "\t"));
        await this.removeFolder(tempFolder);
        //-------------------------
        // Install packages
        //-------------------------
        console.log("Installing packages...");
        let exec = util.promisify(child.exec);
        await exec("npm install", { cwd: `${answers.folder}` });
        console.log("Project created.");
    }
}
exports.default = Example;
Example.description = `Creates a project from a GitHub example.`;
