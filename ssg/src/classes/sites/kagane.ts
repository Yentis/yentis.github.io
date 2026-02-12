import { BaseData, BaseSite } from './baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { Manga } from 'src/classes/manga'
import type { HttpRequest } from 'src/interfaces/httpRequest'
import { requestHandler } from 'src/services/requestService'
import { titleContainsQuery } from 'src/utils/siteUtils'
import moment from 'moment'
import { ContentType } from 'src/enums/contentTypeEnum'

interface KaganeManga {
  series_id: string
  title: string
  series_alternate_titles: {
    title: string
  }[]
  series_books: {
    book_id: string
    title: string
    published_on: string
    sort_no: number
  }[]
  series_covers: {
    image_id: string
  }[]
}

interface KaganeSearch {
  content: {
    series_id: string
    title: string
    source_id: string
    current_books: number
    alternate_titles: string[]
    cover_image_id: string
  }[]
}

interface KaganeSources {
  sources: KaganeSource[]
}

interface KaganeSource {
  source_id: string
  title: string
}

class KaganeData extends BaseData {
  manga: KaganeManga

  constructor(manga: KaganeManga, url: string) {
    super(url)
    this.manga = manga
  }
}

export class Kagane extends BaseSite {
  siteType = SiteType.Kagane
  private sources: Record<string, KaganeSource> = {}

  protected override getChapter(data: KaganeData): string {
    return data.manga.series_books[0]?.title ?? 'Unknown'
  }

  protected override getChapterUrl(data: KaganeData): string {
    const chapterId = data.manga.series_books[0]?.book_id
    if (!chapterId) return ''

    return `${this.getUrl()}/series/${data.manga.series_id}/reader/${chapterId}`
  }

  protected override getChapterNum(data: KaganeData): number {
    return data.manga.series_books[0]?.sort_no ?? 0
  }

  protected override getChapterDate(data: KaganeData): string {
    const chapter = data.manga.series_books[0]
    if (!chapter) return ''

    const chapterDate = moment(chapter.published_on)
    if (chapterDate.isValid()) {
      return chapterDate.fromNow()
    } else {
      return ''
    }
  }

  protected override getTitle(data: KaganeData): string {
    return data.manga.title
  }

  protected override getImage(data: KaganeData): string {
    const imageId = data.manga.series_covers[0]?.image_id
    if (!imageId) return ''

    return this.getImageById(imageId)
  }

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

  private getImageById(imageId: string): string {
    return `https://yuzuki.kagane.org/api/v2/image/${imageId}/compressed`
  }

  protected async readUrlImpl(url: string): Promise<Error | Manga> {
    const seriesId = url.split('/series/')[1]
    if (seriesId === undefined) return new Error('No series id found')

    const request: HttpRequest = { method: 'GET', url: `https://yuzuki.kagane.org/api/v2/series/${seriesId}` }
    const response = await requestHandler.sendRequest(request)

    const mangaData = JSON.parse(response.data) as KaganeManga
    mangaData.series_books.reverse()

    return this.buildManga(new KaganeData(mangaData, url))
  }

  protected async searchImpl(query: string): Promise<Error | Manga[]> {
    const request: HttpRequest = {
      method: 'POST',
      url: `https://yuzuki.kagane.org/api/v2/search/series?page=0&size=10&scanlations=true`,
      data: `{ "title": "${query}" }`,
      headers: { 'Content-Type': ContentType.JSON },
    }

    const response = await requestHandler.sendRequest(request)
    const searchData = JSON.parse(response.data) as KaganeSearch
    const mangaList: Manga[] = []

    if (Object.keys(this.sources).length <= 0) {
      await this.fetchSources()
    }

    searchData.content.forEach((entry) => {
      const match = [entry.title, ...entry.alternate_titles].some((title) => {
        return titleContainsQuery(query, title)
      })
      if (!match) return

      const url = `${this.getUrl()}/series/${entry.series_id}`
      const manga = new Manga(url, this.siteType)

      manga.title = `${entry.title} (${this.sources[entry.source_id]?.title})`
      manga.chapter = entry.current_books.toString()
      manga.image = this.getImageById(entry.cover_image_id)

      mangaList.push(manga)
    })

    return mangaList
  }

  private async fetchSources(): Promise<void> {
    const sourcesRequest: HttpRequest = {
      method: 'POST',
      url: 'https://yuzuki.kagane.org/api/v2/sources/list',
      data: '{ "source_types": null }',
      headers: { 'Content-Type': ContentType.JSON },
    }

    const sourcesResponse = await requestHandler.sendRequest(sourcesRequest)
    const data = JSON.parse(sourcesResponse.data) as KaganeSources
    data.sources.forEach((source) => {
      this.sources[source.source_id] = source
    })
  }

  getTestUrl(): string {
    return `${this.getUrl()}/series/019c29bc-0812-7957-a697-94a6f70f09d6`
  }
}
