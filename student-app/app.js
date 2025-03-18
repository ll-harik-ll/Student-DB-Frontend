const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
require("dotenv").config();
const DBConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
};

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Optional Explicitation
app.use(express.urlencoded({ extended: true })); // To parse form data

app.get("/", (req,res) => {
    res.render('index', {
        student_records: [],
        searchParams: {},
        errorMessage: ""
    });
});

app.post("/find-records", async (req,res) => {
    console.log("Received Request Data: ", req.body);

    try {
        let {regNo, name, dept, regType, isVerified} = req.body;
        let query = "SELECT * FROM students WHERE 1=1";
        let params = {};

        if (regNo) {
            query += " AND register_no = :regNo";
            params.regNo = regNo;
        }
        if (name) {
            query += " AND name = :name";
            params.name = name;
        }
        if (dept) {
            query += " AND dept = :dept";
            params.dept = dept;
        }
        if (regType) {
            query += " AND register_type = :regType";
            params.regType = regType;
        }
        if (isVerified) {
            query += " AND is_verified = :isVerified";
            params.isVerified = isVerified;
        }

        console.log("Executing Query:", query, "With Params:", params);

        const connection = await oracledb.getConnection(DBConfig); // Await Database Connection
        const result = await connection.execute(query,params); // Await Execution
        console.log("Query Result:", result.rows);
        await connection.close(); // Await Connection Closure after Execution

        res.render('index', {
            student_records: result.rows,
            searchParams: req.body,
            errorMessage: ""
        });
    } catch (error) {
        console.error("Database error:", error);
        res.render('index', {
            student_records: [],
            searchParams: req.body,
            errorMessage: "Database Error: " + error.message
        });
    }
});

app.post('/add-records', async (req,res) => {
    console.log("Received form data for insertion:", req.body);

    try {
        let {regNo, name, dept, regType, isVerified} = req.body;
        let query = `INSERT INTO students (register_no, name, dept, register_type, is_verified)
                     VALUES (:regNo, :name, :dept, :regType, :isVerified)`;
        let params = { regNo, name, dept, regType, isVerified }

        console.log("Executing Insert Query:", query, "With Params:", params);

        const connection = await oracledb.getConnection(DBConfig); // Await Database Connection
        try {
            const result = await connection.execute(query,params, { autoCommit: true }); // Await Execution + Commit
            console.log("Insert successful!");
            res.render('index', {
                student_records: [],
                searchParams: {},
                errorMessage: "Student Record Successfully Added"
            })
        } catch (error) {
            if (error.errorNum === 1) { // ORA-00001: Unique constraint violated
                res.render("index", {
                    student_records: [],
                    searchParams: req.body,
                    errorMessage: "Error: Register Number already exists!"
                });
            } else {
                res.render("index", {
                    student_records: [],
                    searchParams: req.body,
                    errorMessage: "Database error: " + error.message
                });
            }
        }
        
        await connection.close(); // Await Connection Closure after Execution
    } catch (error) {
        console.error("Database error on insert:", error);
        res.render("index", {
            student_records: [],
            searchParams: req.body,
            errorMessage: "Database error: " + error.message
        });
    }
});

app.post('/update-verification', async (req,res) => {
    try {
        let query = `BEGIN update_lateral_verification; END;`;
        const connection = await oracledb.getConnection(DBConfig); // Await Database Connection
        await connection.execute(query,[],{ autoCommit: true }); // Await Execution + Commit
        console.log("Verification Status for Lateral Entries Updated");
        await connection.close(); // Await Connection Closure after Execution
    } catch (error) {
        console.error("Database error:", error);
        res.render('index', {
            student_records: [],
            searchParams: req.body,
            errorMessage: "Database Error: " + error.message
        });
    }
})

const port = 3000;
app.listen(port, () => console.log(`App is running on port ${port}`));