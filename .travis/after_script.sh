if [ "$TRAVIS_BRANCH" = "master" ]; then
    echo "### Deploy Changes"
    git config credential.helper "store --file=.git/credentials"
    echo "https://${GH_TOKEN}:@github.com" > .git/credentials

    export GIT_REMOTE_URL="https://${GH_TOKEN:-git}@github.com/atomicptr/dauntless-builder.git"
    export COMMIT_MESSAGE="[travis-ci] auto build $(date +'%F %H:%M %Z')"
    bash ./scripts/deploy.sh --commit
fi