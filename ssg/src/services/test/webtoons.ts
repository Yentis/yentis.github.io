import moment from 'moment'
import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'

const SITE_TYPE = SiteType.Webtoons
const QUERY = 'the wolf & red riding hood'

export async function testWebtoons (): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await search(site)
}

async function readUrl (site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)

  desired.chapter = 'Episode 16'
  desired.title = 'The Wolf & Red Riding Hood'
  desired.chapterUrl = 'https://www.webtoons.com/en/comedy/wolf-and-red-riding-hood/episode-16/viewer?title_no=2142&episode_no=16'
  desired.chapterNum = 16
  desired.chapterDate = moment('Jul 24, 2020', 'MMM DD, YYYY').fromNow()

  mangaEqual(manga, desired, {
    imageEqual: (_, actual) => actual.startsWith('https://swebtoon-phinf.pstatic.net/')
  })
}

async function search (site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://swebtoon-phinf.pstatic.net/20200723_179/1595472180242yyeWz_JPEG/1.jpg'
  desired.chapter = 'Episode 16'
  desired.url = 'https://www.webtoons.com/episodeList?titleNo=2142'

  return searchValid(results, desired, QUERY)
}
