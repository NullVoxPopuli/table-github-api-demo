import Component from '@glimmer/component';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';

export default class FiltersComponent extends Component {
  @tracked isPrivate = false;
  @tracked languageFilter = '';

  @action
  isPrivateCheck(event) {
    this.isPrivate = event.target.checked;
  }

  @action
  languageFilterCheck(event) {
    this.languageFilter = event.target.value;
  }

  get filteredRepositories() {
    let repos = this.args.repos;

    if (this.languageFilter && this.languageFilter !== 'All') {
      repos = repos.filterBy('language', this.languageFilter);
    }

    return repos.filterBy('private', this.isPrivate);
  }

  @cached
  get languages() {
    let languages = [...new Set(this.args.repos.map((a) => a.language))];
    let cleanedLanguages = languages.filter((lang) => lang !== null);

    return ['All'].concat(cleanedLanguages);
  }
}
