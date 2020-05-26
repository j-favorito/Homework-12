const inq = require("inquirer");
const mysql = require("mysql2/promise");
const savedRoles = [];
const savedDepts = [];


const main = async()=>{
    try{
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'password',
            database: 'business_db'
        })
        console.log(`Connected via ${connection.threadId}`)
    }
    catch(err){
        console.log(err)
    }
}

main();