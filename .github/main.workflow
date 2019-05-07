workflow "Lint, Test & Deploy" {
  on = "push"
  resolves = ["Deploy"]
}

action "Install" {
  uses = "actions/npm@master"
  args = "install"
}

action "Lint" {
  needs = "Install"
  uses = "actions/npm@master"
  args = "run lint"
}

action "Build" {
  needs = "Install"
  uses = "actions/npm@master"
  args = "run build"
}

action "Test" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "run coverage"
}

action "Master" {
  uses = "actions/bin/filter@master"
  needs = ["Lint", "Test"]
  args = "branch master"
}

action "Secrets" {
  uses = "actions/bin/sh@master"
  args = ["echo \"$SECRETS_JSON\" | base64 --decode > secrets.json"]
  needs = ["Master"]
  secrets = ["SECRETS_JSON"]
}

action "Authenticate" {
  uses = "actions/gcloud/auth@master"
  needs = ["Secrets"]
  secrets = ["GCLOUD_AUTH"]
}

action "Deploy" {
  uses = "actions/gcloud/cli@master"
  args = "app deploy --project=mdn-bcd-collector"
  needs = ["Authenticate"]
}
