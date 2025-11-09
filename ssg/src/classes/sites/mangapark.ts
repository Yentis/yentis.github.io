import { Manga } from 'src/classes/manga'
import { SiteType } from 'src/enums/siteEnum'
import HttpRequest from 'src/interfaces/httpRequest'
import { requestHandler } from 'src/services/requestService'
import { parseHtmlFromString, parseNum, titleContainsQuery } from 'src/utils/siteUtils'
import { BaseData, BaseSite } from './baseSite'
import moment from 'moment'

interface SearchResponse {
  data: {
    get_searchComic: {
      items: {
        data: {
          id: string
          name: string
          urlPath: string
          urlCover600: string
          altNames: string[]
          max_chapterNode: {
            data: {
              id: string
              dateCreate: number
              dname: string
              urlPath: string
            }
          }
        }
      }[]
    }
  }
}

export class MangaPark extends BaseSite {
  siteType = SiteType.MangaPark

  protected override getChapterNum(data: BaseData): number {
    const chapterNum = parseNum(data.chapterNum?.textContent?.trim().split(' ')[1])
    if (chapterNum !== 0) return chapterNum

    return 0
  }

  protected override getChapterDate(data: BaseData): string {
    const timestamp = data.chapterDate?.getAttribute('data-time')
    if (!timestamp) return ''

    return moment(timestamp, 'x').fromNow();
  }

  protected override getImage(data: BaseData): string {
    const url = data.image?.getAttribute('content') ?? ''
    if (url.startsWith('/')) return `${this.getUrl()}${url}`

    return url;
  }

  protected async readUrlImpl (url: string): Promise<Error | Manga> {
    const request: HttpRequest = { method: 'GET', url }
    const response = await requestHandler.sendRequest(request)

    const doc = await parseHtmlFromString(response.data)
    const data = new BaseData(url)

    const chapterList = doc.querySelectorAll('[data-name="chapter-list"]')[0]
    data.chapter = chapterList?.querySelectorAll('a')[0]
    data.chapterDate = chapterList?.querySelectorAll('[data-time]')[0]
    data.chapterNum = data.chapter
    data.image = doc.querySelectorAll('meta[property="og:image"]')[0]
    data.title = doc.querySelectorAll('h3 a')[0]

    return this.buildManga(data)
  }

  protected async searchImpl (query: string): Promise<Error | Manga[]> {
    const request: HttpRequest = {
      method: 'POST',
      url: `${this.getUrl()}/apo/`,
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
          query: `query get_searchComic($select: SearchComic_Select) {
          get_searchComic(select: $select) {
            items {
              data {
                id name
                urlPath urlCover600
                altNames
                max_chapterNode {
                  data {
                    id dateCreate
                    dname urlPath
                  }
                }
              }
            }
          }
        }`,
        variables: {
          select: {
            word: query,
            size: 10,
            page: 1,
            sortby: 'field_score'
          }
        }
      }),
    }

    const response = await requestHandler.sendRequest(request)
    const searchResponse = JSON.parse(response.data) as SearchResponse
    const mangaList: Manga[] = []

    searchResponse.data.get_searchComic.items.forEach((item) => {
      const url = `${this.getUrl()}${item.data.urlPath}`
      const manga = new Manga(url, this.siteType)

      manga.title = item.data.name
      manga.image = `${this.getUrl()}${item.data.urlCover600}`
      manga.chapter = item.data.max_chapterNode.data.dname

      const titles = [item.data.name, ...item.data.altNames];
      if (titles.some((title) => titleContainsQuery(query, title))) {
        mangaList.push(manga)
      }
    })

    return mangaList
  }

  getTestUrl (): string {
    return `${this.getUrl()}/title/105519-en-i-found-somebody-to-love`
  }
}
