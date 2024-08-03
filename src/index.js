const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const collection = require("./mongodb");

// Correcting the path for templates
const templatePath = path.join(__dirname, "src/templates");

// Correcting the path for the public directory
const publicPath = path.join(__dirname, 'public');
const cssPath = path.join(publicPath, 'css');

// Ensure the public/css directory exists
if (!fs.existsSync(cssPath)) {
    fs.mkdirSync(cssPath, { recursive: true });
    console.log("Created public/css directory.");
}

app.use('/images', express.static(path.join(__dirname, 'src/images')));
app.use(express.static(publicPath)); // Serve static files from the public directory

// Log the template and public paths
console.log("Templates path:", templatePath);
console.log("Public path:", publicPath);

// Ensure the template directory exists
if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
    console.log("Created templates directory.");
}

// Ensure the required template files exist with minimal content
const templates = {
    "home.hbs": "<h1>Home Page</h1>",
    "login.hbs": "<h1>Login Page</h1>",
    "signup.hbs": "<h1>Signup Page</h1>"
};

for (const [file, content] of Object.entries(templates)) {
    const filePath = path.join(templatePath, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`Created ${file}.`);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle form data
app.set("view engine", "hbs");
app.set("views", templatePath);

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        password: req.body.password
    };

    try {
        await collection.insertMany([data]);
        res.render("home");
    } catch (error) {
        res.status(500).send("Error saving data to database");
    }
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    // Here you can add your logic to authenticate the user
    // For example, check the user in the database
    const user = await collection.findOne({ name, password });

    if (user) {
        // Authentication successful
        res.render("home");
    } else {
        // Authentication failed
        res.status(401).send("Invalid credentials");
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

