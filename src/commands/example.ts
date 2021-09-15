import { Command, flags } from "@oclif/command";
import { fchownSync, promises as fsp } from "fs";
import * as path from "path";
import * as inquirer from "inquirer";
import * as glob from "glob";
import got from "got";
import * as fs from "fs-extra";
import * as child from "child_process";
import * as util from "util";
import * as jszip from "jszip";
import JSZip = require("jszip");
import { dir } from "console";
import { setTimeout } from "timers/promises";


export default class Example extends Command {
  static description = `Creates a project from a GitHub example.`;

  async extract(zipFile:Buffer, outPath:string):Promise<void> {

    let contents =  await jszip.loadAsync(zipFile);

    for( const filename of Object.keys(contents.files)) {

        // exclude the root folder
        let search = /^.*?(\/)(.*)/.exec(filename);
        
        if(search !== null) {        

           //console.log(search[2]);
            let dest = outPath + "/" + search[2] ;
            let buff = await contents.file(filename)?.async("nodebuffer")
        
            if(buff){
                await fsp.mkdir(path.parse(dest).dir,{recursive:true});
                await fsp.writeFile(dest, buff);
            }
        }
        
    };  
  }

  async removeFolder(folderPath:string): Promise<void>{
      await fsp.rm(folderPath, {force:true, recursive:true});
  }

  async run() {

    let gitExampleResponse = await got("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/examples").json<Array<any>>();
    let gitProtoResponse = await got("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/prototypes").json<Array<any>>();
    let gitCatalogResponse = await got("https://api.github.com/repos/tibcosoftware/spotfire-mods/contents/catalog").json<Array<any>>();

    let listOfProjects = gitExampleResponse.concat(gitProtoResponse, gitCatalogResponse).filter((e)=> e.type === "dir");
   

    if(listOfProjects === null || listOfProjects.length === 0) {
        this.log("Couldn't fetch the exampel list from github");
        return;
    }

    let logo = await fsp.readFile( path.join(__dirname, "..", `template/logo.txt`));
    this.log(logo.toString(), "\n");

    let exampleChoices = listOfProjects.map((e) => { return {name:e.name,value:e}});
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
            default: (a:any) => "new-" + a.exampleChoice.name,
        },
        {
            type: "input",
            name: "modName",
            message: "Mode name: ",
            default: (a:any) => "new-" + a.exampleChoice.name,
        },
        {
            type: "input",
            name: "modId",
            message: "Mode id: ",
            default: (a:any) => "new-" + a.exampleChoice.name,
        },
      ]);

    this.log("Fetching example");
    let examplesZip = await got('https://api.github.com/repos/tibcosoftware/spotfire-mods/zipball').buffer();
    let tempFolder =  path.normalize(process.cwd() + `/temp`)
    
    await fsp.mkdir(answers.folder); 
    await this.removeFolder(tempFolder);
    await fsp.mkdir(tempFolder);
    await this.extract(examplesZip,tempFolder)

    
    let exampleTempPath = path.normalize(tempFolder + "/" + answers.exampleChoice.path)
    
    
    await fs.copy(exampleTempPath, answers.folder);

    //------------------------
    // Add the mod manifest
    //------------------------
    let  manifestPath = glob.sync(answers.folder + "/**/mod-manifest.json");
    console.log(manifestPath+"-----------------");
    if(manifestPath.length === 0){
        console.log(`There is no mod-manifest.json in ${answers.folder}`);
        return;
    }

    if(manifestPath.length > 1){
      
       manifestPath = await inquirer.prompt([
        {
          type: "list",
          name: "manifestPath",
          message: `Multiple mod-manifest.json files found. Which one to update? `,
          default: 0,
          choices: manifestPath.map( p => {return {name:p, value:p}})
        }
      ]).then( a => [a.manifestPath]);
    }

    let manifest = await fsp.readFile(manifestPath[0]);
    let manifestJson = JSON.parse(manifest.toString());
   
    
    manifestJson.name = answers.modName;
    manifestJson.id = answers.modId;

    await fsp.writeFile(manifestPath[0], JSON.stringify(manifestJson, null, "\t"));
    await this.removeFolder(tempFolder);
    
    




  


    
      

    
   
    


   
   //let gitExampels = gitExampelsResponse.map((e)=> e.name)
   //let examplesZip = await got('https://api.github.com/repos/tibcosoftware/spotfire-mods/zipball').buffer();
   //let result = contents.filter((path,file) => path.endsWith("js-dev-starter"))
   //let data  =  result[0].async("uint8array");
   

//    let examplesZip = await fsp.readFile('D:/TIBCOSoftware-spotfire-mods-1.2.0-5-gb8bd70f.zip');
//    let tempPath = path.normalize(process.cwd() + "/temp/").toString() ;
//    await this.removeFolder(tempPath);
//    await this.extract(examplesZip,tempPath)

  

   
   
   
   
   

//    let exec = util.promisify(child.exec);
//    await exec("git  install", { cwd: `${answers.folder}` });


  }
}
