workflow "Lint and Test" {
  on = "push"
  resolves = ["Lint", "Deploy"]
}

action "Install" {
  uses = "actions/npm@master"
  args = "install"
}

action "Build" {
  needs = "Install"
  uses = "actions/npm@master"
  args = "run build"
}

action "Lint" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "run lint"
}

action "Test" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "run coverage"
}

action "Master" {
  uses = "actions/bin/filter@master"
  needs = ["Test"]
  args = "branch master"
}

action "Authenticate" {
  uses = "actions/gcloud/auth@master"
  needs = ["Master"]
  secrets = ["GCLOUD_AUTH"]
}

action "Deploy" {
  uses = "actions/gcloud/cli@master"
  args = "app deploy"
  needs = ["Authenticate"]
}
