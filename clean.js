#!/usr/bin/bun
import { parseArgs } from "util";
import { readdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from 'node:path';

const {values:input, positionals} = parseArgs({
    args: Bun.argv,
    options: {
        folder:{
            type: "string",
        }
    },
    strict: true,
    allowPositionals: true,
});

// input existente
if(!input.folder) throw new Error("No se ingresó un folder");
// el folder existe
if(!existsSync(input.folder)) throw new Error("El folder no existe");
 
const getAllFiles = async (dirPath, arrayOfFiles) => {

    let files = await readdir(dirPath)
    arrayOfFiles = arrayOfFiles || []
  
    for (let file of files) {
        const filePath = join(dirPath, file);
      
        if (statSync(filePath).isDirectory()) {
            arrayOfFiles = await getAllFiles(filePath, arrayOfFiles)
        } else {
            arrayOfFiles.push(filePath)
        }
    }
  
    return arrayOfFiles
  }


const files = await getAllFiles(input.folder);
if(files.length === 0) throw new Error("No hay archivos en el folder");


// Clean files
for (const file of files) {
    console.log("Limpiando archivo: ", file);
    Bun.spawn([
        "mat2",
        "--inplace",
        file
    ])
}

// Check files
for (const file of files) {
    console.log("Verificando archivo: ", file);
    const proc_check = Bun.spawn([ "mat2", "--show", file])
    const check_text = await new Response(proc_check.stdout).text();
    console.log("Check file: ",check_text);
}
