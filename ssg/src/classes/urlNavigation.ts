export class UrlNavigation {
  url: string
  openInApp: boolean

  constructor(url: string, openInApp: boolean = false) {
    this.url = url
    this.openInApp = openInApp
  }
}
