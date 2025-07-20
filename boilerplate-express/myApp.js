let express = require('express');
let app = express();

app.get("/", (req, res) => {
    // res.send("Hello Express");
    absolutePath = __dirname + "/views/index.html";
    res.sendFile(absolutePath);
})

app.use("/public", express.static(__dirname + "/public"));
app.get("/json", (req, res) => {
    res.json({"message": "Hello json"})
})






























 module.exports = app;
