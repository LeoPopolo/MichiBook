import { Client } from 'pg';

import keys from './key';

const pool = new Client(keys.database);

pool.connect()
.then(() =>{
    console.log("database connected");
})
.catch(err => {
    console.log(err);
});

export default pool;