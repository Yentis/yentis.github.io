import { Status } from 'src/enums/status'

export class Manga {
  url: string
  site: ''
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

  constructor (url: string, site: '') {
    this.url = url
    this.site = site
    this.linkedSites = {}
    this.status = Status.READING
  }
}
