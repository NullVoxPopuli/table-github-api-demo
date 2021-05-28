import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MyRepository extends Component {
  @tracked showDetailVisible = false;
  @tracked branches = '';

  @action
  async showDetail(name, organizationName, token) {
    let requestOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: 'token ' + token,
      },
    };
    let response = await fetch(
      'https://api.github.com/repos/' +
        organizationName +
        '/' +
        name +
        '/branches',
      requestOptions
    );
    let data = await response.json();
    if (!response.ok) {
      this.requestError = 'Some of the properties are wrong.';
    } else {
      this.branches = data;
      this.showDetailVisible = !this.showDetailVisible;
    }
  }
}
