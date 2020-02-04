import app from "./App";

async function startApp() {
  await app.getStaticFiles();
  return app.listen();
}


export default startApp();