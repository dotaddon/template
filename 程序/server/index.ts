import { createServer } from 'http';

createServer()
    .listen(8888, () => {
        console.log('listen on port 8888');
        console.log('Server running at http://127.0.0.1:8888/');
        console.log('服务器已经启动，准备接受请求。');
    })
    .on('request', (req, res) => {
        req.on('data', (data) => print(JSON.parse(data)));

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
