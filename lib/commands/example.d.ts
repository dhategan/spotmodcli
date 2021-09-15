/// <reference types="node" />
import { Command } from "@oclif/command";
export default class Example extends Command {
    static description: string;
    extract(zipFile: Buffer, outPath: string): Promise<void>;
    removeFolder(folderPath: string): Promise<void>;
    run(): Promise<void>;
}
