//@ts-check
const rest=require("./rest.js");
const fs=require("fs");
const path=require("path");

const style_rest=new rest("www.wombo.art",100);

function getNEXTdata(force=false){
    let header=parseInt(String(fs.readFileSync("styles.js")).split("\n")[0].slice(2))
    if (force || header>(3600+Date.now())){
    style_rest.get("/api/styles","GET").then((result)=>{
        // console.log(result)
        result=result.sort((a,b)=>{
            return a.id-b.id;
        })
        result=result.filter((f)=>{
            return !f.is_premium;
        });
        console.log(result);
        fs.writeFileSync('styles.json',JSON.stringify(result,['id','name'],"\t"))

    },
    (reason)=>{
        console.error('could not get next data')
        console.error(reason)
    })
    return force || header>(3600+Date.now())
}
}

function updateStylesDotJS(){
    let styles=JSON.parse(String(fs.readFileSync('styles.json')))

    let s=`//${Date.now()}\n`
    s+='let styles = new Map();\n';
    //@ts-ignore-errors
    for (let style of styles){
        s+='styles.set('+style.id+',"'+style.name+'");\n';
    }
    let style_tempate=fs.readFileSync("next_data_template.js");
    s+=String(style_tempate)
    s+="module.exports.default = styles;"
    if (!fs.existsSync("styles.js")){
        fs.openSync("styles.js","w");
    }
    fs.writeFileSync("styles.js",s);
}
function update(force=false) {
    let udneeded=getNEXTdata(force)
    if (udneeded){
        updateStylesDotJS()
    }
    return udneeded
}
module.exports.update=update

if (require.main===module){
    update(true)
}
