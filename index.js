const core = require("@actions/core");

const handleSchedule = require("./lib/handle_schedule");

main();

async function main() {
  handleSchedule();
}

process.on("unhandledRejection", (reason, promise) => {
  core.warning("Unhandled Rejection at:");
  core.warning(promise);
  core.setFailed(reason);
});
