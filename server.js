require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 IndoPost API running
→ App   : http://localhost:${PORT}
→ API   : http://localhost:${PORT}/api
→ Login : http://localhost:${PORT}/login.html
`);
});
