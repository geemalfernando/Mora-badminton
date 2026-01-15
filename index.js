require("dotenv").config();

const app = require("./app");
const { connectToDatabase } = require("./db");

const port = process.env.PORT || 3001;

(async () => {
  try {
    const mongooseInstance = await connectToDatabase();
    // eslint-disable-next-line no-console
    console.log(
      `Database connection is ready. db=${mongooseInstance.connection.name}`
    );

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Listening to port number ${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
})();
