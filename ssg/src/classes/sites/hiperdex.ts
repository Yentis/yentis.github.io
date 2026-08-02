import { SiteType } from 'src/enums/siteEnum'
import { BaseData, BaseSite } from './baseSite'
import PQueue from 'p-queue'
import { requestHandler } from 'src/services/requestService'
import type { HttpRequest } from 'src/interfaces/httpRequest'
import { Manga } from 'src/classes/manga'
import { titleContainsQuery } from 'src/utils/siteUtils'
import moment from 'moment/moment'

interface HiperDexResponse<T> {
  result: {
    data: {
      json: T
    }
  }
}

interface Series {
  id: number
  title: string
  alternativeTitles: string[]
  coverUrl: string
  slug: string
}

interface Chapter {
  id: number
  createdAt: string
  number: number
  title: string | null
}

interface Search {
  hits: {
    id: number
    slug: string
    title: string
    alternativeTitles: string[]
    coverUrl: string
  }[]
}

class HiperDexData extends BaseData {
  series: Series
  chapterData: Chapter

  constructor(url: string, series: Series, chapterData: Chapter) {
    super(url)
    this.series = series
    this.chapterData = chapterData
  }
}

export class HiperDex extends BaseSite {
  siteType = SiteType.HiperDEX
  userAgent: string

  constructor() {
    super()
    this.userAgent = navigator.userAgent
    this.requestQueue = new PQueue({ interval: 1000, intervalCap: 1 })
  }

  protected override getChapter(data: HiperDexData): string {
    return this.getChapterName(data.chapterData)
  }

  private getChapterName(chapter?: Chapter): string {
    if (!chapter) return 'Unknown'

    let chapterTitle = `Chapter ${chapter.number}`
    if (chapter.title) chapterTitle = `${chapterTitle} - ${chapter.title}`
    return chapterTitle
  }

  protected override getChapterUrl(data: HiperDexData): string {
    return `${this.getUrl()}/manga/${data.series.slug}/${data.chapterData.number}`
  }

  protected override getChapterNum(data: HiperDexData): number {
    return data.chapterData.number
  }

  protected override getChapterDate(data: HiperDexData): string {
    const chapterDate = moment(data.chapterData.createdAt)
    if (chapterDate.isValid()) {
      return chapterDate.fromNow()
    } else {
      return ''
    }
  }

  protected override getImage(data: HiperDexData): string {
    return data.series.coverUrl
  }

  override async readImage(url: string): Promise<string> {
    const request: HttpRequest = {
      method: 'GET',
      url,
      headers: {
        referer: this.getUrl(),
        responseType: 'arraybuffer',
      },
    }

    const response = await requestHandler.sendRequest(request)
    return `data:image/png;base64,${response.data}`
  }

  protected override getTitle(data: HiperDexData): string {
    return data.series.title
  }

  protected async readUrlImpl(url: string): Promise<Error | Manga> {
    const slug = url.split('/')[4]?.trim() ?? ''
    if (slug === '') return new Error('Slug not found')

    const seriesQuery = encodeURIComponent(`{"json": {"slug": "${slug}"}}`)
    const request: HttpRequest = {
      method: 'GET',
      url: `${this.getUrl()}/api/trpc/series.bySlugWithGenres?input=${seriesQuery}`,
    }

    const response = await requestHandler.sendRequest(request)
    const seriesData = JSON.parse(response.data) as HiperDexResponse<Series>
    const series = seriesData.result.data.json

    const chapter = (await this.getChapters(series.id))[0]
    if (!chapter) return new Error('No chapters found')

    const data = new HiperDexData(url, series, chapter)

    return this.buildManga(data)
  }

  private async getChapters(seriesId: number): Promise<Chapter[]> {
    const chaptersQuery = encodeURIComponent(`{"json": {"seriesId": ${seriesId}}}`)
    const chaptersRequest: HttpRequest = {
      method: 'GET',
      url: `${this.getUrl()}/api/trpc/series.chapters?input=${chaptersQuery}`,
    }

    const chaptersResponse = await requestHandler.sendRequest(chaptersRequest)
    const chaptersData = JSON.parse(chaptersResponse.data) as HiperDexResponse<Chapter[]>

    return chaptersData.result.data.json
  }

  protected async searchImpl(query: string): Promise<Error | Manga[]> {
    const queryString = encodeURIComponent(`{"json": {"q": "${query}"}}`)
    const request: HttpRequest = { method: 'GET', url: `${this.getUrl()}/api/trpc/search.query?input=${queryString}` }

    const response = await requestHandler.sendRequest(request)
    const searchData = JSON.parse(response.data) as HiperDexResponse<Search>

    const mangaList: Manga[] = []

    for (const hit of searchData.result.data.json.hits) {
      const manga = new Manga(`${this.getUrl()}/manga/${hit.slug}`, this.siteType)
      manga.image = hit.coverUrl
      manga.title = hit.title

      const titles = [hit.title, ...hit.alternativeTitles]
      if (titles.some((title) => titleContainsQuery(query, title))) {
        const chapter = (await this.getChapters(hit.id))[0]
        manga.chapter = this.getChapterName(chapter)

        mangaList.push(manga)
      }
    }

    return mangaList
  }

  override getLoginUrl(): string {
    return this.getUrl()
  }

  getTestUrl(): string {
    return `${this.getUrl()}/manga/10-years-in-the-friend-zone/`
  }
}
