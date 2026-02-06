import moment from 'moment'
import { SiteType } from 'src/enums/siteEnum'
import type { HttpRequest } from 'src/interfaces/httpRequest'
import { requestHandler } from 'src/services/requestService'
import { getDateFromNow, parseHtmlFromString, titleContainsQuery } from 'src/utils/siteUtils'
import type { Manga } from '../manga'
import { BaseData, BaseSite } from './baseSite'
import qs from 'qs'

interface Chapter {
  chapter_name: string
  chapter_slug: string
  chapter_num: number
  updated_at: string
}

interface ChaptersResponse {
  success: boolean
  data: {
    chapters: Chapter[]
  }
}

class MangakakalotData extends BaseData {
  chapterData: Chapter

  constructor(chapterData: Chapter, url: string) {
    super(url)
    this.chapterData = chapterData
  }
}

export class Mangakakalot extends BaseSite {
  siteType = SiteType.Mangakakalot

  public override async readImage(url: string): Promise<string> {
    const request: HttpRequest = {
      method: 'GET',
      url,
      headers: {
        referer: `${this.getUrl()}/`,
        responseType: 'arraybuffer',
      },
    }

    const response = await requestHandler.sendRequest(request)
    return `data:image/png;base64,${response.data}`
  }

  protected override getChapter(data: MangakakalotData | BaseData): string {
    if (data instanceof MangakakalotData) {
      return data.chapterData.chapter_name
    } else {
      return super.getChapter(data)
    }
  }

  protected override getChapterUrl(data: MangakakalotData | BaseData): string {
    if (data instanceof MangakakalotData) {
      const url = new URL(data.url)

      if (!url.pathname.endsWith('/')) {
        url.pathname = url.pathname + '/'
      }
      url.pathname = url.pathname + data.chapterData.chapter_slug

      return url.toString()
    } else {
      return super.getChapterUrl(data)
    }
  }

  protected override getChapterNum(data: MangakakalotData | BaseData): number {
    if (data instanceof MangakakalotData) {
      return data.chapterData.chapter_num
    } else {
      const chapter = this.getChapter(data)
      const matches = /Chapter ([-+]?[0-9]*\.?[0-9]+)/gm.exec(chapter) || []
      let num = 0

      for (const match of matches) {
        const parsedMatch = parseFloat(match)
        if (!isNaN(parsedMatch)) num = parsedMatch
      }

      return num
    }
  }

  protected override getChapterDate(data: MangakakalotData | BaseData): string {
    if (data instanceof MangakakalotData) {
      const chapterDate = moment(data.chapterData.updated_at)
      if (chapterDate.isValid()) {
        return chapterDate.fromNow()
      } else {
        return ''
      }
    } else {
      const chapterDate = moment(data.chapterDate?.getAttribute('title'), 'MMM-DD-YYYY')
      if (chapterDate.isValid()) {
        return chapterDate.fromNow()
      } else {
        return getDateFromNow(data.chapterDate?.getAttribute('title'))
      }
    }
  }

  protected async readUrlImpl(url: string): Promise<Error | Manga> {
    const request: HttpRequest = { method: 'GET', url }
    this.trySetUserAgent(request)

    const response = await requestHandler.sendRequest(request)
    const doc = await parseHtmlFromString(response.data)

    const chapters = await this.getChapters(url)
    const chapter = chapters.data.chapters[0]
    if (!chapter) return new Error('No chapter found')

    const data = new MangakakalotData(chapter, url)
    data.image = doc.querySelectorAll('.manga-info-pic img')[0]
    data.title = doc.querySelectorAll('.manga-info-text h1')[0]

    return this.buildManga(data)
  }

  private async getChapters(url: string): Promise<ChaptersResponse> {
    const queryString = qs.stringify({
      limit: '1',
      offset: '0',
    })

    const request: HttpRequest = {
      method: 'GET',
      url: `${url.replace('/manga/', '/api/manga/')}/chapters?${queryString}`,
      headers: {
        referer: `${this.getUrl()}/`,
      },
    }

    const response = await requestHandler.sendRequest(request)
    return JSON.parse(response.data) as ChaptersResponse
  }

  protected async searchImpl(query: string): Promise<Error | Manga[]> {
    const request: HttpRequest = {
      method: 'GET',
      url: `${this.getUrl()}/search/story/${this.changeAlias(query)}`,
      headers: {
        referer: `${this.getUrl()}/`,
      },
    }
    const response = await requestHandler.sendRequest(request)

    const doc = await parseHtmlFromString(response.data)
    const searchItems = doc.querySelectorAll('.story_item')
    const mangaList = []

    for (const item of searchItems) {
      const url = item.querySelectorAll('a')[0]?.getAttribute('href')
      if (!url) continue

      const data = new BaseData(url)
      data.title = item.querySelectorAll('.story_name')[0]
      data.image = item.querySelectorAll('img')[0]
      data.chapter = item.querySelectorAll('.story_chapter')[0]

      const manga = this.buildManga(data)
      if (!titleContainsQuery(query, manga.title)) continue

      mangaList.push(manga)
    }

    return mangaList
  }

  // Taken directly from the site
  private changeAlias(alias: string): string {
    let str = alias
    str = str.toLowerCase()
    str = str.replace(/Ã |Ã¡|áº¡|áº£|Ã£|Ã¢|áº§|áº¥|áº­|áº©|áº«|Äƒ|áº±|áº¯|áº·|áº³|áºµ/g, 'a')
    str = str.replace(/Ã¨|Ã©|áº¹|áº»|áº½|Ãª|á»|áº¿|á»‡|á»ƒ|á»…/g, 'e')
    str = str.replace(/Ã¬|Ã­|á»‹|á»‰|Ä©/g, 'i')
    str = str.replace(/Ã²|Ã³|á»|á»|Ãµ|Ã´|á»“|á»‘|á»™|á»•|á»—|Æ¡|á»|á»›|á»£|á»Ÿ|á»¡/g, 'o')
    str = str.replace(/Ã¹|Ãº|á»¥|á»§|Å©|Æ°|á»«|á»©|á»±|á»­|á»¯/g, 'u')
    str = str.replace(/á»³|Ã½|á»µ|á»·|á»¹/g, 'y')
    str = str.replace(/Ä‘/g, 'd')
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|=|<|>|\?|\/|,|\.|:|;|'| |"|&|#|\[|]|~|-|$|_/g, '_')
    str = str.replace(/_+_/g, '_')
    str = str.replace(/^_+|_+$/g, '')
    return str
  }

  override getUrl(): string {
    return `https://www.${this.siteType}`
  }

  override getLoginUrl(): string {
    return 'https://user.manganelo.com/login?l=mangakakalot'
  }

  getTestUrl(): string {
    return `${this.getUrl()}/manga/osananajimi-ni-najimitai`
  }
}
