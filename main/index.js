// Required Dependencies
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');

// Connect to database
const db = mysql.createConnection(
	{
		host: 'localhost',
		user: 'root',
		password: 'Colo!12',
		database: 'employee_db',
	},
	console.log(`Connected to the employee database.`)
);

// Inquirer Prompts for Initial/Main User Navigation
const prompts = [
	{
		type: 'list',
		message: 'What would you like to do?',
		name: 'start',
		choices: [
			'View All Employees',
			'Add Employee',
			'Update Employee Role',
			'View All Roles',
			'Add Role',
			'View All Departments',
			'Add Department',
			'Quit',
		],
	},
];

// Add Employee
function createEmployee() {
	// Shows all roles
	function availableRoles() {
		// variable to show all in the roles table
		let sql = 'SELECT * FROM roles';

		// Runs the query
		db.query(sql, async function (err, result) {
			// Throws an error
			if (err) throw err;
			// Iterates through role names & ids and pushes to array
			for (let i = 0; i < result.length; i++) {
				employeeRoles.push(result[i].title);
				roleIdName[result[i].title] = result[i].id;
			}
		});
	}

	// Array to store all the departments
	let employeeRoles = [];
	// Object to store the department ID's
	const roleIdName = {};

	availableRoles();

	// Shows all managers
	function availableManagers() {
		// variable to show all in the employees table
		let sql = 'SELECT * FROM employee';

		// Runs the query
		db.query(sql, async function (err, result) {
			// Throws an error
			if (err) throw err;
			// Iterates through manager names & ids and pushes to array
			for (let i = 0; i < result.length; i++) {
				employeeManagers.push(result[i].first_name.concat(" ", result[i].last_name));
				managerIdName[result[i].first_name.concat(" ", result[i].last_name)] = result[i].id;
			}
		});
	}

	// Array to store all the departments
	let employeeManagers = [];
	// Object to store the department ID's
	const managerIdName = {};

	availableManagers();

	// Inquirer Prompts for Adding a new role
	const newEmployee = [
		{
			type: 'input',
			message: "What is the employee's first name?",
			name: 'firstName',
		},
		{
			type: 'input',
			message: "What is the employee's last name?",
			name: 'lastName',
		},
		{
			type: 'list',
			message: "What is the employee's role?",
			name: 'employeeRole',
			choices: employeeRoles,
		},
		{
			type: 'list',
			message: "Who is the employee's manager?",
			name: 'employeeManager',
			choices: employeeManagers,
		},
	];

	// Prompts the user for their response
	inquirer.prompt(newEmployee).then((response) => {
		const sql =
			'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)';

		db.query(
			sql,
			[
				response.firstName,
				response.lastName,
				roleIdName[response.employeeRole],
				managerIdName[response.employeeManager],
			],
			function (err, result) {
				if (err) {
					console.log(err);
					process.exit();
				}
				console.log(
					`Added ${response.firstName} ${response.lastName} to the database`
				);

				init();
			}
		);
	});
}

function updateRole() {
	inquirer.prompt([
		{
			name: "roleId",
			type: "input",
			message: "What is the ID of the employee you are trying to update?"
		},
		{
			name: "newRole",
			type: "input",
			message: "What is the name of the new role?"
		}
	]).then(response => {
		db.query("UPDATE roles SET ? WHERE ?;", 
		[
			{
				title: response.newRole
			},
			{
				id: response.roleId
			}
		]);
		console.log("Updated employee's role")
		init();
})};

// View all employees
function viewEmployees() {
	var sql = `SELECT employee.id, employee.first_name, employee.last_name, title, name AS department, salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee INNER JOIN roles ON employee.role_id = roles.id INNER JOIN department ON department.id = roles.department_id LEFT JOIN employee AS manager ON manager.id = employee.manager_id ORDER BY employee.id ASC;`;
	db.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			process.exit();
		}
		console.table(result);
		init();
	});
}

// View all roles
function viewRoles() {
	var sql = `SELECT roles.id, title, name AS department, salary FROM roles
    INNER JOIN department
    ON roles.department_id = department.id;`;
	db.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			process.exit();
		}
		console.table(result);
		init();
	});
}

// Adding a new department to the department table
function addDepartment() {
	// Inquirer Prompt for Adding a New Department
	const newDepartment = [
		{
			type: 'input',
			message: 'What is the name of the department?',
			name: 'newDepartment',
		},
	];

	// Prompts the user for their response
	inquirer.prompt(newDepartment).then((response) => {
		// SQL language to add the users response into the department table
		const sql = `INSERT INTO department (name) VALUES ("${response.newDepartment}");`;
		// Queries SQL using above line of code to actually make the new row
		db.query(sql, (err, result) => {
			if (err) {
				console.log(err);
				process.exit();
			}
			// Logs their response to the console
			console.log(`Added ${response.newDepartment} to the database`);

			// Sends user back to initial/main prompts
			init();
		});
	});
}

// Adding a new role to the roles table
function addRole() {
	// Shows all departments
	function availableDepartments() {
		// variable to show all in the department table
		let sql = 'SELECT * FROM department';

		// Runs the query
		db.query(sql, async function (err, result) {
			// Throws an error
			if (err) throw err;
			// Iterates through department names & ids and pushes to array
			for (let i = 0; i < result.length; i++) {
				myChoices.push(result[i].name);
				departmentIdName[result[i].name] = result[i].id;
			}
		});
	}
	// Array to store all the departments
	let myChoices = [];
	// Object to store the department ID's
	const departmentIdName = {};

	availableDepartments();

	// Inquirer Prompts for Adding a new role
	const newRole = [
		{
			type: 'input',
			message: 'What is the name of the role?',
			name: 'newRole',
		},
		{
			type: 'input',
			message: 'What is the salary of the role?',
			name: 'salary',
		},
		{
			type: 'list',
			message: 'Which department does the role belong to?',
			name: 'department',
			choices: myChoices,
		},
	];

	// Prompts the user for their response
	inquirer.prompt(newRole).then((response) => {
		const sql =
			'INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)';

		db.query(
			sql,
			[
				response.newRole,
				response.salary,
				departmentIdName[response.department],
			],
			function (err, result) {
				if (err) {
					console.log(err);
					process.exit();
				}
				console.log(`Added ${response.department} to the database`);

				init();
			}
		);
	});
}

// Views all departments
function viewDepartments() {
	var sql = 'SELECT * FROM department;';
	db.query(sql, (err, result) => {
		if (err) {
			console.log(err);
			process.exit();
		}
		console.table(result);
		init();
	});
}

function init() {
	inquirer.prompt(prompts).then((response) => {
		console.log(response.start);

		switch (response.start) {
			case 'View All Employees':
				viewEmployees();
				break;

			case 'Add Employee':
				createEmployee();
				break;

			case 'Update Employee Role':
				updateRole();
				break;

			case 'View All Roles':
				viewRoles();
				break;

			case 'Add Role':
				addRole();
				break;

			case 'View All Departments':
				viewDepartments();
				break;

			case 'Add Department':
				addDepartment();
				break;

			case 'Quit':
				process.exit();
		}
	});
}

init();
