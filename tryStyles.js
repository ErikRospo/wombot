const wombot = require("./index.js");
const stylesmap = require("./styles.js");
const fs = require("fs");
let stys=JSON.parse(fs.readFileSync("styles.json",{"encoding":"utf-8"}))
let maxv=0
for (let n=0;n<stys.length;n++){
    maxv=Math.max(maxv,stys[n].id)
}
let numITs = Math.ceil(maxv/10)*10;
let blockSize = 5;
const quiet = true
let blockNumber = Math.floor(numITs / blockSize);
let prompt="test"
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
async function main() {
    let task_lengths=[]
    let task_works=[]
    let start = Date.now();
    for (let n = 0; n < blockNumber; n++) {
        let tasks = [];
        for (let m = 0; m < blockSize; m++) {
            let task_index = n * blockSize + m;
            task_lengths.push(0)
            task_works.push(true)
            let task = wombot(prompt, task_index, (data) => { handler(data,"",0) }, { final: false, inter: false, download_dir: "/tmp/"  ,ignore_errors:true}).then((val)=>{
                try{
                    task_lengths[task_index]=val.task.generated_photo_keys.length
                    task_works[task_index]=true
                } catch{
                    task_works[task_index]=false
                    task_lengths[task_index]=-1
                }
            console.log(`task #${task_index+1} done`)
                
            })
            tasks.push(task);
        }
        await Promise.all(tasks);
        console.log(`Block ${n + 1}/${blockNumber} done`)
    }
    let tasks = []
    for (let m = blockNumber * blockSize; m < numITs.length; m++) {
        task_lengths.push(0)
        task_works.push(true)
        let task = wombot(prompt, m, (data) => { handler(data,"",0) }, { final: false, inter: false, download_dir: "/tmp/"  ,ignore_errors:true}).then((val)=>{
            try{
                task_lengths[m]=val.task.generated_photo_keys.length
                task_works[m]=true
            } catch{
                task_works[m]=false
                task_lengths[m]=-1
            }
            console.log(`task #${task_index+1} done`)
            
        })
        tasks.push(task);
    }
    await Promise.all(tasks);
    let end = Date.now();
    console.log(`Done in ${(end - start) / 1000}s`)
    s=""
    s+="let steps= new Map();\n"
    
    for (let n=0;n<numITs;n++){
        if (task_works[n]){
            s+="steps.set("+n+","+task_lengths[n]+");\n"
        }    
    }
    s+="module.exports.steps=steps;"
    fs.writeFileSync("./next_data_template",s);
}
main()