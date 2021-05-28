import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, timeout } from 'ember-concurrency';

export default class DataProviderComponent extends Component {
  @service apiClient;

  @tracked requestError = '';

  get repositories() {
    return this.submitToken.last?.value ?? [];
  }

  get isLoading() {
    return this.submitToken.isRunning;
  }

  get isError() {
    return this.submitToken.last?.isError;
  }

  @action
  reFetch() {
    this.submitToken.perform();
  }

  @restartableTask
  *submitToken() {
    yield timeout(300);

    let { orgName, token } = this.args;

    let client = this.apiClient.setup(`https://api.github.com`, token);

    this.requestError = '';

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
