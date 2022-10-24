const wombot = require("./index.js");
const stylesmap = require("./styles.js");
const fs = require("fs");

let prompts = fs.readFileSync("prompts.txt", "utf-8").split("\n");
let stylesOld = fs.readFileSync("styles.txt", "utf-8").split("\n");
prompts = prompts.filter((f) => { return f.length > 2 })
let styles = stylesOld.map((f) => { return Number(f) });
styles = styles.filter((f) => { return f > 0 });
let numPoS = Math.max(prompts.length, styles.length)
let zipped = []
for (let n = 0; n < numPoS; n++) {
    let s = 0
    let p = ""
    if (n >= (styles.length)) {
        s = styles[styles.length - 1]
    } else {
        s = styles[n]
    }
    if (n >= (prompts.length)) {
        p = prompts[prompts.length - 1]
    } else {
        p = prompts[n]
    }
    zipped.push([p, s])

}

const quiet = false
function handler(data, prefix, style) {
    switch (data.state) {
        case "authenticated":
            if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
            break;
        case "allocated":
            if (!quiet) console.log(`${prefix}Allocated, submitting the prompt and style...`);
            break;
        case "submitted":
            if (!quiet) console.log(`${prefix}Submitted! Waiting on results...`);
            break;
        case "progress":
            let current = data.task.photo_url_list.length;
            let max = stylesmap.steps.get(style) + 1;
            if (!max) {
                max = 20;
            }
            if (!quiet) console.log(`${prefix}Submitted! Waiting on results... (${current}/${max})`);
            break;
        case "generated":
            if (!quiet) console.log(`${prefix}Results are in, downloading the final image...`);
            break;
        case "downloaded":
            if (!quiet) console.log(`${prefix}Downloaded!`);
            break;
    }
}
function getTaskName(z){
    return String(z[0] + "/" + String(stylesmap.default.get(z[1]))).replace(/ /g, "_").replace(/\./g, "")
}
async function main() {
    let tasks = [];
    let task_index=-1;
    function consumeNewTask(){
        task_index++;        
        if (task_index>=numPoS){

            return 
        } else{
            let z = zipped[task_index];
            let task_name=getTaskName(z)
            console.log(`Task ${task_index+1} started`)    
            wombot(z[0], z[1], (data) => { handler(data, task_name + ": ", z[1]) }, { final: true, inter: false, download_dir: "./generated/" + task_name }).then((t)=>{tasks.push(t);consumeNewTask()})
        }
    }
    console.log("Starting")
    for (let n=0;n<6;n++){
        consumeNewTask();
        await (new Promise((res) => setTimeout(res, 2000)));
    }
        
}
main()