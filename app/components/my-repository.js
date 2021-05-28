import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class MyRepository extends Component {
  @service apiClient;

  @tracked showDetailVisible = false;

  get url() {
    return this.args.repository.html_url;
  }

  get branches() {
    return this.showDetail.last?.value ?? [];
  }

  @restartableTask
  *showDetail() {
    let { organizationName, repository } = this.args;
    let { name } = repository;

    let [data, response] = yield this.apiClient.get(`/repos/${organizationName}/${name}/branches`);

    if (!response.ok) {
      this.requestError = 'Some of the properties are wrong.';
      return;
    }

    this.showDetailVisible = true;

    return data;
  }
}
