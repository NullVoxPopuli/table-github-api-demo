import Service from '@ember/service';
import { action } from '@ember/object';

export default class ApiClientService extends Service {
  setup(host, token) {
    this.host = host;
    this.defaultRequestOptions = {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: 'token ' + token,
      },
    };

    return this;
  }

  @action
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
