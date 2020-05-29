const inq = require("inquirer");
const mysql = require("mysql2/promise");
//global arrays to hold table data
let savedRoles = [];
let savedDepts = [];
let savedEmployees = [];

//inital questions
const askQuestion = async (connection) => {
    await inq
        .prompt({
            type: 'list',
            name: 'option',
            message: 'What would you like to do?',
            choices: ['Add', 'View', 'Update']
        })
        .then(function (res) {
            if (res.option == 'Add') {
                inq
                    .prompt({
                        type: 'list',
                        name: 'selection',
                        message: 'What are you adding(MUST ADD DEPARTMENT THEN ROLE THEN EMPLOYEE FIRST USE)?',
                        choices: ['Employee', 'Role', 'Department']
                    })
                    .then(function (res2) {
                        addQuestion(connection, res2.selection);
                    });
            }
            else if (res.option == 'View') {
                inq
                    .prompt({
                        type: 'list',
                        name: 'selection',
                        message: 'What are you Viewing?',
                        choices: ['Employee', 'Role', 'Department']
                    })
                    .then(function (res2) {
                        viewQuestion(connection, res2.selection);
                    });
            }
            else if (res.option == 'Update') {
                inq
                    .prompt([{
                        type: 'list',
                        name: 'employeeChange',
                        message: "Last name of employee to change? ",
                        choices: savedEmployees
                    },{
                        type: 'list',
                        name: 'newRole',
                        message: 'New Role: ',
                        choices: savedRoles
                    }])
                    .then(function (res) {
                        updateQuestion(connection, res.employeeChange, res.newRole);
                    })
            }
        });
}

//function called if chosing to add
const addQuestion = async (connection, table) => {
    //employee addition questions
    if (table == 'Employee') {
        await inq
            .prompt([{
                type: 'input',
                name: 'employeeFirst',
                message: 'New Employee First Name: '
            }, {
                type: 'input',
                name: 'employeeLast',
                message: 'New Employee Last Name: '
            }, {
                type: 'list',
                name: 'employeeRole',
                message: "Which department will the employee be working for? ",
                choices: savedRoles
            }])
            .then(function (res) {
                addEmployee(connection, res.employeeFirst, res.employeeLast, res.employeeRole)
            })
    }
    //role addition questions
    else if (table == 'Role') {
        await inq
            .prompt([{
                type: 'input',
                name: 'roleName',
                message: 'New Role Name: '
            }, {
                type: 'input',
                name: 'roleSalary',
                message: 'New Role Salary: '
            },
            {
                type: 'list',
                name: 'roleDept',
                message: 'Which department will this role be assigned to?',
                choices: savedDepts
            }])
            .then(function (res) {
                //                console.log(res.roleDept)
                addRole(connection, res.roleName, res.roleSalary, res.roleDept)
            })
    }
    //table addition questions
    else if (table == 'Department') {
        await inq
            .prompt({
                type: 'input',
                name: 'deptName',
                message: 'New Department Name: '
            })
            .then(function (res) {
                addDept(connection, res.deptName)
            })
    }
}

//retrieves table data
const retrieveData = async (connection) => {
    savedRoles=[];
    const [roleRows, roleFields] = await connection.query('SELECT * FROM role');
    //    console.log(roleRows);
    savedRoles = roleRows;
    savedDepts = [];
    const [deptRows, deptFields] = await connection.query('SELECT * FROM department');
    //    console.log(deptRows);
    savedDepts = deptRows;
    savedEmployees=[];
    const [employeeRows] = await connection.query('SELECT * FROM employee');
    employeeRows.forEach(row => {
        savedEmployees.push(row.last_name);
    });
}

//adds new employee to table
const addEmployee = async (connection, firstName, lastName, employeeRole) => {
    const roleQry = 'SELECT * FROM role'
    const [roleRows] = await connection.query(roleQry);
    let roleID;
    roleRows.forEach(row => {
        if (row.name == employeeRole) {
            roleID = row.id
        }
    });
    const employeeQry = 'INSERT INTO employee SET ?'
    const params = { first_name: firstName, last_name: lastName, role_id: roleID };
    const [rows, fields] = await connection.query(employeeQry, params);
    //    console.log(rows);
    await contQuestion(connection);
}

//adds new role to table
const addRole = async (connection, roleName, roleSalary, roleDept) => {
    //    console.log(roleName,roleSalary,roleDept)
    const deptQry = 'SELECT * FROM department'
    const [deptRows] = await connection.query(deptQry);
    let deptID;
    deptRows.forEach(row => {
        if (row.name == roleDept) {
            deptID = row.id
        }
    });
    const roleQry = 'INSERT INTO role SET ?'
    const params = { name: roleName, salary: roleSalary, departmnet_id: deptID }
    const [rows, fields] = await connection.query(roleQry, params);
    //    console.log(rows);
    await contQuestion(connection);
}
//adds new department to table
const addDept = async (connection, deptName) => {
    const deptQry = 'INSERT INTO department SET ?'
    const params = { name: deptName };
    const [rows, fields] = await connection.query(deptQry, params);
    //   console.log(rows);
    await contQuestion(connection);
}
//displays table in terminal
const viewQuestion = async (connection, selection) => {
    const viewQry = 'SELECT * FROM ' + selection;
    const [viewRows] = await connection.query(viewQry);
    console.table(viewRows);
    await contQuestion(connection);
}
//updates an employee
const updateQuestion = async (connection, employee,role) => {
    const roleQry = 'SELECT * FROM role'
    const [roleRows] = await connection.query(roleQry);
    let roleID;
    roleRows.forEach(row => {
        if (row.name == role) {
            roleID = row.id
        }
    });
    const employeeQry = 'SELECT * FROM employee'
    const [employeeRows] = await connection.query(employeeQry);
    let employeeID;
    employeeRows.forEach(row => {
        if (row.last_name == employee) {
            employeeID = row.id;
        }
    });
    const updateQry='UPDATE employee SET ? WHERE ?'
    const updateParams=[{role_id:roleID},{id:employeeID}]
    const [updateRows]=await connection.query(updateQry,updateParams);
    contQuestion(connection);
}
//question to loop code
const contQuestion = async (connection) => {
    await inq
        .prompt({
            type: 'confirm',
            name: 'continue',
            message: 'Continue? '
        })
        .then(function (res) {
            if (res.continue == true) {
                main();
            }
            else { connection.end() }
        })
}
//main async function
const main = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'password',
            database: 'business_db'
        })
        console.log(`Connected via ${connection.threadId}`)
        await retrieveData(connection);
        await askQuestion(connection);
    }
    catch (err) {
        console.log(err)
    }
}

main()