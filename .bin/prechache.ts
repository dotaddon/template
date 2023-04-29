import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { getAddonPath, read_all_files } from "@dotaddon/rigger";


const { server } = getAddonPath()
const root = join(server, 'scripts', "vscripts");


const listParticle = new Set<String>()
const listSound = new Set<String>()
const listModel = new Set<String>()

read_all_files(root)
    .filter(e => e.endsWith('.lua') && !e.includes('vscripts/init'))
    .map(filePath => {
        readFileSync(filePath, "utf8")
            .toString()
            .split("\n")
            .filter(e => !e.startsWith("--") && e != '')//删除前几行以"//"开始的注释行 与空行
            .map(line => {
                line
                    .split(/('|")/)
                    .filter(e => !e.includes('.'))
                    .map(e => {
                        switch (true) {
                            case e.endsWith(".vpcf"):
                                e != '.vpcf' && listParticle.add(e)
                                break;

                            case e.endsWith(".vmdl"):
                                e != '.vmdl' && listModel.add(e)
                                break;
                            case e.endsWith(".vsndevts"):
                                e != '.vsndevts' && listSound.add(e)
                                break;
                        }
                    })
            })
    })

writeFileSync(join('src', 'vscripts', 'init', "listParticle.json"), JSON.stringify([...listParticle]), 'utf-8')
writeFileSync(join('src', 'vscripts', 'init', "listSound.json"), JSON.stringify([...listSound]), 'utf-8')
writeFileSync(join('src', 'vscripts', 'init', "listModel.json"), JSON.stringify([...listModel]), 'utf-8')