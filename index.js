// setup mongoose connection
const mongoose = require('mongoose');
mongoose.set("strictQuery", false);

// DB url
const mongoDB = ""

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}