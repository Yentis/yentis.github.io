import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'
import moment from 'moment'

const SITE_TYPE = SiteType.MangaPark
const QUERY = 'I found somebody to love'

export async function testMangaPark(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  const chapter = 88

  desired.chapter = `Chapter ${chapter}`
  desired.title = 'I Found Somebody To Love'
  desired.image = 'https://mangapark.net/thumb/W600/amim/27b/60458725c9d6ca2779010b72_225_324_93166.jpeg'
  desired.chapterUrl = 'https://mangapark.net/title/105519-en-i-found-somebody-to-love/3091914-chapter-88'
  desired.chapterNum = chapter
  desired.chapterDate = moment('1615017606244', 'x').fromNow()

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)

  desired.image = 'https://mangapark.net/thumb/W600/amim/27b/60458725c9d6ca2779010b72_225_324_93166.jpeg'
  desired.chapter = 'Chapter 88'
  desired.url = 'https://mangapark.net/title/105519-en-i-found-somebody-to-love'

  return searchValid(results, desired, QUERY)
}
