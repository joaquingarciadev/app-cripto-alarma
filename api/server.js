const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("cors")());

app.listen(3001, () => {
    console.log("Server started on port 3001");
});
