const GitHubApi = require('github');
const BbPromise = require('bluebird');

const github = new GitHubApi({
    debug: false,
    protocol: 'https',
    host: 'api.github.com', // should be api.github.com for GitHub
    pathPrefix: '/api/v3', // for some GHEs; none for GitHub
    headers: {
        'user-agent': 'seneca-heartbeat' // GitHub is happy with a unique user agent
    },
    Promise: BbPromise,
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

const oAuthSettings = {
    type: 'token',
    token: process.env.GITHUB_TOKEN
};

const drgit = {
    owner: 'DigitalRetailing',
    repo: 'dr-services'
};

module.exports = {
    getReleaseVersion() {
        // oauth key/secret (to get a token)
        github.authenticate(oAuthSettings);

        const p = new Promise((resolve, reject) => {
            github.repos.getReleases({
                owner: drgit.owner,
                repo: drgit.repo
            }, (err, res) => {
                const releases = res.data;
                if (err || releases.length === 0) {
                    reject('');
                }

                resolve(releases[0].tag_name);
            });
        });

        return p.then((tag) => {
            return tag;
        }, () => {
            return '';
        });
    }
};
