import Controller from '@ember/controller';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class ApplicationController extends Controller {
  @tracked requestError = '';
  @tracked isPrivate = false;
  @tracked languageFilter = '';

  @action
  isPrivateCheck(event) {
    this.isPrivate = event.target.checked;
  }

  @action
  languageFilterCheck(language) {
    this.languageFilter = language;
  }

  get repositories() {
    return this.submitToken.last?.value ?? [];
  }

  get filteredRepositories() {
    let repos = this.repositories;

    if (this.languageFilter && this.languageFilter !== 'All') {
      repos = repos.filterBy('language', this.languageFilter);
    }

    return repos.filterBy('private', this.isPrivate);
  }

  @cached
  get languages() {
    let languages = [...new Set(this.repositories.map((a) => a.language))];
    let cleanedLanguages = languages.filter((lang) => lang !== null);

    return ['All'].concat(cleanedLanguages);
  }

  @task
  *submitToken() {
    let requestOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: 'token ' + this.token,
      },
    };

    let client = new ApiClient(`https://api.github.com`, requestOptions);

    this.requestError = '';

    let orgName = this.organizationName;
    let [repositories, response] = yield client.get(`/orgs/${orgName}/repos`);

    if (!response.ok) {
      this.requestError = 'Token or organization name is invalid.';

      return;
    }

    let data = yield Promise.all(
      repositories.map(async (entry) => {
        let [branches] = await client.get(`/repos/${orgName}/${entry.name}/branches`);
        return branches;
      })
    );

    data.forEach(function (entry, index) {
      repositories[index].branch_count = entry.length;
    });

    return repositories;
  }
}

class ApiClient {
  constructor(host, defaultRequestOptions = {}) {
    this.host = host;
    this.requestOptions = defaultRequestOptions;
  }

  get(url, options = {}) {
    return getJson(`${this.host}${url}`, {
      ...this.requestOptions,
      ...options,
    });
  }
}

async function getJson(url, options) {
  let response = await fetch(url, options);

  return [await response.json(), response];
}
