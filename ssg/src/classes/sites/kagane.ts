import { BaseData, BaseSite } from './baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { Manga } from 'src/classes/manga'
import type { HttpRequest } from 'src/interfaces/httpRequest'
import { requestHandler } from 'src/services/requestService'
import { titleContainsQuery } from 'src/utils/siteUtils'
import moment from 'moment'
import { ContentType } from 'src/enums/contentTypeEnum'

interface KaganeSeries {
  id: string
  name: string
  alternate_titles: {
    title: string
  }[]
}

interface KaganeBooks {
  content: {
    id: string
    title: string
    release_date: string
    number_sort: number
  }[]
}

type KaganeManga = KaganeSeries & KaganeBooks

interface KaganeSearch {
  content: {
    id: string
    name: string
    source: string
    books_count: number
    alternate_titles: {
      title: string
    }[]
  }[]
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

  protected override getChapter(data: KaganeData): string {
    return data.manga.content[0]?.title ?? 'Unknown'
  }

  protected override getChapterUrl(data: KaganeData): string {
    const chapterId = data.manga.content[0]?.id
    if (!chapterId) return ''

    return `${this.getUrl()}/series/${data.manga.id}/reader/${chapterId}`
  }

  protected override getChapterNum(data: KaganeData): number {
    return data.manga.content[0]?.number_sort ?? 0
  }

  protected override getChapterDate(data: KaganeData): string {
    const chapter = data.manga.content[0]
    if (!chapter) return ''

    const chapterDate = moment(chapter.release_date, 'YYYY-MM-DD')
    if (chapterDate.isValid()) {
      return chapterDate.fromNow()
    } else {
      return ''
    }
  }

  protected override getTitle(data: KaganeData): string {
    return data.manga.name
  }

  protected override getImage(data: KaganeData): string {
    return this.getImageBySeries(data.manga.id)
  }

  private getImageBySeries(seriesId: string): string {
    return `https://api.kagane.org/api/v1/series/${seriesId}/thumbnail`
  }

  protected async readUrlImpl(url: string): Promise<Error | Manga> {
    const seriesId = url.split('/series/')[1]
    if (seriesId === undefined) return new Error('No series id found')

    const requestSeries: HttpRequest = { method: 'GET', url: `https://api.kagane.org/api/v1/series/${seriesId}` }
    const responseSeries = await requestHandler.sendRequest(requestSeries)
    const series = JSON.parse(responseSeries.data) as KaganeSeries

    const requestBooks: HttpRequest = { method: 'GET', url: `https://api.kagane.org/api/v1/books/${seriesId}` }
    const responseBooks = await requestHandler.sendRequest(requestBooks)
    const books = JSON.parse(responseBooks.data) as KaganeBooks

    books.content.reverse()
    const mangaData: KaganeManga = {
      ...series,
      ...books,
    }

    return this.buildManga(new KaganeData(mangaData, url))
  }

  protected async searchImpl(query: string): Promise<Error | Manga[]> {
    const request: HttpRequest = {
      method: 'POST',
      url: `https://api.kagane.org/api/v1/search?page=0&size=30&name=${encodeURIComponent(query)}&scanlations=true`,
      data: '{"sources":[],"content_rating":["safe","suggestive","erotica","pornographic"]}',
      headers: { 'Content-Type': ContentType.JSON },
    }

    const response = await requestHandler.sendRequest(request)
    const searchData = JSON.parse(response.data) as KaganeSearch
    const mangaList: Manga[] = []

    searchData.content.forEach((entry) => {
      const match = [entry.name, ...entry.alternate_titles.map((alternate) => alternate.title)].some((title) => {
        return titleContainsQuery(query, title)
      })
      if (!match) return

      const url = `${this.getUrl()}/series/${entry.id}`
      const manga = new Manga(url, this.siteType)

      manga.title = `${entry.name} (${entry.source})`
      manga.chapter = entry.books_count.toString()
      manga.image = this.getImageBySeries(entry.id)

      mangaList.push(manga)
    })

    return mangaList
  }

  getTestUrl(): string {
    return `${this.getUrl()}/series/3MABGJX6J2FLZRTX0B4PRYJSU5`
  }
}
