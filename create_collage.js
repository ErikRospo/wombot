const wombot = require("./index.js");
const stylesmap = require("./styles.js");
const fs = require("fs");
const PImage = require("pureimage");

const { randomUUID } = require("crypto");

let prompts = fs.readFileSync("prompts.txt", "utf-8").split("\n");
let styles = fs.readFileSync("styles.txt", "utf-8").split("\n");
prompts = prompts.filter((f) => { return f.length > 2 })
styles = styles.map((f) => { return Number(f) });
styles = styles.filter((f) => { return f > 0 });
// let numPoS = Math.max(prompts.length, styles.length)
let zipped = []
const boxes = 200;
for (let n = 0; n < boxes; n++) {
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
let runIdentifier = randomUUID();
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
function getTaskName(z) {
    return runIdentifier
}
async function main() {
    let start = Date.now();
    let alltasks = []
    for (let n = 0; n < blockNumber; n++) {
        let tasks = [];
        let st = Date.now()
        for (let m = 0; m < blockSize; m++) {
            let task_index = n * blockSize + m;
            let z = zipped[task_index];
            let task_name = getTaskName(task_index)
            let task = wombot(z[0], z[1], (data) => { handler(data, `${task_index + 1}/${(zipped.length)}: `, z[1]) }, { final: true, inter: false, download_dir: "./generated/" + task_name })
            tasks.push(task);
            alltasks.push(task)
        }
        await Promise.all(tasks);
        let et = Date.now();
        console.log(`Block ${n + 1}/${blockNumber} done in ${(et - st) / 1000}s`)
    }
    let tasks = []
    for (let m = blockNumber * blockSize; m < zipped.length; m++) {
        let z = zipped[m];
        let task_name = getTaskName(m)
        let task = wombot(z[0], z[1], (data) => { handler(data, `${m + 1}/${(zipped.length)}: `, z[1]) }, { final: true, inter: false, download_dir: "./generated/" + task_name + "/" })
        tasks.push(task);
        alltasks.push(task)

    }
    await Promise.all(tasks);
    let tsks = await Promise.all(alltasks)
    // console.log(tsks)
    let end = Date.now();
    console.log(`Done in ${(end - start) / 1000}s`)
    const width = 5000;
    const height = 5000;

    const whratio = width / height;
    const f = 3;
    function AdjustDistribution(x) {
        return 1 - ((1 - x) ** f)
    }
    let boxesArray = []
    for (let index = 0; index < boxes; index++) {
        let size = (AdjustDistribution(Math.random())) * Math.min(width, height);
        let h = size;
        let w = size * whratio;
        let x = Math.random() * width;
        let y = Math.random() * height;
        if (w + x > width) {
            x = width - w
        }
        if (h + y > height) {
            y = height - h
        }
        boxesArray.push([x, y, w, h])
    }
    console.log("making image")
    const img1 = PImage.make(width, height)
    const ctx = img1.getContext("2d");
    let img2 = await PImage.decodeJPEGFromStream(fs.createReadStream(tsks[0].path))
    ctx.drawImage(img2, 0,0);
    for (let index = 0; index < boxes; index++) {
        img2 = await PImage.decodeJPEGFromStream(fs.createReadStream(tsks[index].path))
        ctx.drawImage(img2, boxesArray[index][0], boxesArray[index][1], boxesArray[index][2], boxesArray[index][3])
    }
    console.log("image made")
    console.log("writing image")
    PImage.encodePNGToStream(img1, fs.createWriteStream('generated/' + runIdentifier + '/out.png')).then(() => {
        console.log("wrote out the png file to out.png");
        let end2 = Date.now();
        console.log(`Done in ${(end2 - end) / 1000}s`)
        console.log(`Total done in ${(end2 - start) / 1000}s / ${(end2 - start) / 60000}m`)


    }).catch((e) => {
        console.log("there was an error writing");
    });
}
main()