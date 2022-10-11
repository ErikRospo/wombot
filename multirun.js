const wombot = require("./index.js");
const stylesmap = require("./styles.js");
const fs = require("fs");

let prompts = fs.readFileSync("prompts.txt", "utf-8").split("\n");
let styles = fs.readFileSync("styles.txt", "utf-8").split("\n");
prompts = prompts.filter((f) => { return f.length > 2 })
styles = styles.map((f) => { return Number(f) });
styles = styles.filter((f) => { return f > 0 });
let numPoS = Math.max(prompts.length, styles.length)
let zipped = []
for (let n = 0; n < numPoS; n++) {
    s = 0
    p = ""
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

let blockSize = 5;
const quiet = false
let blockNumber = Math.floor(zipped.length / blockSize);
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
    let start = Date.now();
    for (let n = 0; n < blockNumber; n++) {
        let tasks = [];
        for (let m = 0; m < blockSize; m++) {
            let task_index = n * blockSize + m;
            let z = zipped[task_index];
            let task_name=getTaskName(z)
            let task = wombot(z[0], z[1], (data) => { handler(data, task_name + ": ", z[1]) }, { final: true, inter: false, download_dir: "./generated/" + task_name })
            tasks.push(task);
        }
        await Promise.all(tasks);
        console.log(`Block ${n + 1}/${blockNumber} done`)
    }
    let tasks = []
    for (let m = blockNumber * blockSize; m < zipped.length; m++) {
        let z = zipped[m];
        let task_name=getTaskName(z)
        let task = wombot(z[0], z[1], (data) => { handler(data, task_name + ": ", z[1]) }, { final: true, inter: false, download_dir: "./generated/" + task_name })
        tasks.push(task);
    }
    await Promise.all(tasks);
    let end = Date.now();
    console.log(`Done in ${(end - start) / 1000}s`)
}
main()