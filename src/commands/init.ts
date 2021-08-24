import { Command, flags } from '@oclif/command'
import { promises as fsp } from 'fs';
import * as inquirer from 'inquirer';


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
                    {name: "1.0 - Spotfire 11.0", value: "1.0"},
                    {name: "1.1 - Spotfire 11.3", value: "1.1"},
                    {name: "1.2 - Spotfire 11.4", value: "1.2"},
                    {name: "1.3 - Spotfire 11.5", value: "1.3"}
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
    }
}