# scheduled-merge-action

> GitHub Action to merge pull requests on a scheduled day

Changes done on orignal action to suite my need [merge-schedule-action](https://github.com/gr2m/merge-schedule-action)
## Usage

Create `.github/workflows/merge-schedule.yml`

```yml
name: Merge Schedule
on:
  pull_request:
    types:
      - opened
      - edited
  schedule:
    # https://crontab.guru/every-hour
    - cron: 0 * * * *

jobs:
  merge_schedule:
    runs-on: ubuntu-latest
    steps:
      - uses: joeljacobdev/scheduled-merge-action
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

In your pull requests, add a line to the end of the pull request description look looking like this

```
/schedule 2019-12-31
```

To control at which time of the day you want the pull request to be merged, I recommend to adapt the `- cron: ...` setting in the workflow file.
Template of workflow given in `.github/workflows/scheduled-merge.template`

Template from workflow
Additional features
 - exclude draft PR
 - TODO: exclude PR based on label
 - TODO: option to rebase before merge
 - TODO: option to squash before merge

## License

[ISC](LICENSE)
