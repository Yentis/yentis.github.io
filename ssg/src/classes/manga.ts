import { SiteType } from 'src/enums/sites'
import { Status } from 'src/enums/status'

export class Manga {
  url: string
  site: SiteType
  chapter = 'Unknown'
  chapterNum = 0
  image = ''
  title = 'Unknown'
  chapterUrl = ''
  chapterDate = ''
  read: string | undefined
  readNum: number | undefined
  readUrl: string | undefined
  linkedSites: Record<string, number>
  status: Status
  notes: string | undefined
  rating: number | undefined

  constructor (url: string, site: SiteType) {
    this.url = url
    this.site = site
    this.linkedSites = {}
    this.status = Status.READING
  }
}
