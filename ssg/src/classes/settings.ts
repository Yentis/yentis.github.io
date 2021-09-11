import { SortType } from 'src/enums/sortingEnum'
import { Status } from 'src/enums/statusEnum'
import { RefreshOptions } from './refreshOptions'

export class Settings {
  openInBrowser: boolean
  refreshOptions: RefreshOptions
  sortedBy: SortType
  filters: Status[]

  constructor (
    openInBrowser = false,
    refreshOptions = new RefreshOptions(),
    sortedBy = SortType.TITLE,
    filters = Object.values(Status)
  ) {
    this.openInBrowser = openInBrowser
    this.refreshOptions = new RefreshOptions(refreshOptions.enabled, refreshOptions.period)
    this.sortedBy = sortedBy
    this.filters = filters
  }

  equals (settings: Settings) {
    return this.openInBrowser === settings.openInBrowser &&
           this.refreshOptions.equals(settings.refreshOptions) &&
           this.sortedBy === settings.sortedBy &&
           this.filters === settings.filters
  }

  static clone (settings: Settings) {
    return new Settings(
      settings.openInBrowser,
      new RefreshOptions(
        settings.refreshOptions.enabled,
        settings.refreshOptions.period
      ),
      settings.sortedBy,
      settings.filters
    )
  }
}
