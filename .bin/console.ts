import { createServer } from 'http';
import { errMap } from '@dotaddon/packer'

createServer()
    .listen(8888, () => {
        console.log('listen on port 8888');
        console.log('Server running at http://127.0.0.1:8888/');
        console.log('服务器已经启动，准备接受请求。');
    })
    .on('request', (req, res) => {
        req.on('data', (data) => {
            let _data = JSON.parse(data)
            switch (_data.type) {
                case 'error':
                    error(_data)
                    break;
                default:
                    print(_data)
                    break;
            }
        });

        res.write('success');
        res.end();
    });

function print(result: { log: string[]; table: object[] }) {
    let log = Object.values(result.log);
    let table = Object.values(result.table);
    if (table.length > 0) table.forEach((e) => console.table(e));
    if (log.length > 0) {
        log.forEach((e) => console.log(e));
    }
}

async function error(params: {
    name: string
    message: string
    stack?: string
}) {
    if (params.stack)
        console.error(await errMap(params.stack))
    else
        console.error(params.message)
}