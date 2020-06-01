module.exports = handleSchedule;

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

async function handleSchedule() {
  const octokit = new Octokit();
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

  const labels = process.env.LABELS ? process.env.LABELS.split(',') : [];
  if (labels.length === 0) {
    core.info(`No labels defined to exclude PR`);
  }

  core.info(`Loading open pull request`);
  const pullRequests = await octokit.paginate(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open"
    },
    response => {
      return response.data
        .filter(pullRequest => hasScheduleCommand(pullRequest))
        .filter(pullRequest => isntFromFork(pullRequest))
        .filter(pullRequest => !pullRequest.draft)
        .filter(pullRequest => labels.length > 0  ? checkLabel(labels, pullRequest.labels): true)
        .map(pullRequest => {
          return {
            number: pullRequest.number,
            html_url: pullRequest.html_url,
            scheduledDate: getScheduleDateString(pullRequest.body)
          };
        });
    }
  );

  if (!pullRequests || pullRequests.length === 0) {
    core.info(`No scheduled pull requests found`);
    return;
  }
  core.info(`${pullRequests.length} scheduled pull requests found`);

  const duePullRequests = pullRequests.filter(
    pullRequest => new Date(pullRequest.scheduledDate) < new Date()
  );
  core.info(`${duePullRequests.length} due pull requests found`);

  if (duePullRequests.length === 0) {
    return;
  }

  for await (const pullRequest of duePullRequests) {
    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullRequest.number
    });
    core.info(`${pullRequest.html_url} merged`);
  }
}

function hasScheduleCommand(pullRequest) {
  return /(^|\n)\/schedule /.test(pullRequest.body);
}

function isntFromFork(pullRequest) {
  return !pullRequest.head.repo.fork;
}

function getScheduleDateString(text) {
  return text.match(/(^|\n)\/schedule (.*)/).pop();
}

function checkLabel(labels, pullRequestLabels) {
  return pullRequestLabels.some(label => labels.includes(label.name));
}
