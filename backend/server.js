import app from "./app.js";
import connectDB from "./src/config/database.js";

const port = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`The app is listening on http://localhost:${port}`);
    });
})