const wombot = require("./index.js");
const stylesmap = require("./styles.js");
const fs = require("fs");
let stys = JSON.parse(fs.readFileSync("styles.json", { encoding: "utf-8" }));
let maxv = 0;
for (let n = 0; n < stys.length; n++) {
  maxv = Math.max(maxv, stys[n].id);
}
let numITs = (Math.ceil(maxv / 10)+1) * 10;
const quiet = true;
let prompt = "test";
function handler(data, prefix, style) {
  switch (data.state) {
    case "authenticated":
      if (!quiet) console.log(`${prefix}Authenticated, allocating a task...`);
      break;
    case "allocated":
      if (!quiet)
        console.log(`${prefix}Allocated, submitting the prompt and style...`);
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
      if (!quiet)
        console.log(
          `${prefix}Submitted! Waiting on results... (${current}/${max})`
        );
      break;
    case "generated":
      if (!quiet)
        console.log(`${prefix}Results are in, downloading the final image...`);
      break;
    case "downloaded":
      if (!quiet) console.log(`${prefix}Downloaded!`);
      break;
  }
}
async function main() {
  let task_lengths = [];
  let task_works = [];
  let tasks_done = 0;
  let alltasks = [];
  let task_index=0;
  function checkStyle() {
    if (task_index < numITs) {
      console.log(`Task #${task_index + 1} started`);

      task_lengths.push(0);
      task_works.push(true);
      task_index++;

      let t = wombot(
        prompt,
        task_index,
        (data) => {
          handler(data, "", 0);
        },
        {
          final: false,
          inter: false,
          download_dir: "/tmp/",
          ignore_errors: true,
        }
      ).then((val) => {
        try {
            if (val.task.generated_photo_keys.length>0){
            task_works[val.style] = true;
          task_lengths[val.style] = val.task.generated_photo_keys.length;
            }
        } catch {
          task_works[val.style] = false;
          task_lengths[val.style] = -1;
        }
        tasks_done += 1;
        console.log(`Task #${val.style + 1} done, ${tasks_done} total done. ${task_works[val.style]?"Works in "+task_lengths[val.style]+" steps":""}`);

        checkStyle();
      });
      alltasks.push(t);
    }
  }
  for (let n = 0; n < 5; n++) {
    checkStyle();
    await new Promise((res) => setTimeout(res, 2000));
  }
  await Promise.all(alltasks)
  let s = "";
  s += "let steps= new Map();\n";

  for (let n = 0; n < numITs; n++) {
    if (task_works[n]&task_lengths[n]>0) {
      s += "steps.set(" + n + "," + task_lengths[n] + ");\n";
    }
  }
  s += "module.exports.steps=steps;\n\n";
  fs.writeFileSync("./next_data_template.js", s);
}
main();
