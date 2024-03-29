import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'

const SITE_TYPE = SiteType.LSComic
const QUERY = 'volcanic age'

export async function testLSComic(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await readUrlCorrectSeasonOrder()
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  const chapter = 123

  desired.chapter = `Chapter ${chapter}`
  desired.image = 'https://lscomic.com/wp-content/uploads/2023/09/bannerTCF.jpg'
  desired.title = 'The Count’s Lazy Firstborn'
  desired.chapterUrl = `https://lscomic.com/manga/tcf/chapter-${chapter}/`
  desired.chapterNum = chapter
  desired.chapterDate = '6 days ago'

  mangaEqual(manga, desired)
}

async function readUrlCorrectSeasonOrder(): Promise<void> {
  const url = 'https://lscomic.com/manga/tale-of-a-scribe-who-retires-to-the-countryside/'
  const manga = await getMangaInfo(url, SITE_TYPE)
  const desired = new Manga(url, SITE_TYPE)
  const chapter = 199

  desired.chapter = `Chapter ${chapter}`
  desired.image = 'https://lscomic.com/wp-content/uploads/2023/09/bannerTSRC.jpg'
  desired.title = 'Tale of a Scribe Who Retires to the Countryside'
  desired.chapterUrl = `https://lscomic.com/manga/tale-of-a-scribe-who-retires-to-the-countryside/chapter-${chapter}/`
  desired.chapterNum = chapter

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://lscomic.com/wp-content/uploads/2023/09/coverS5-193x278.jpg'
  desired.chapter = 'Chapter 270'
  desired.url = 'https://lscomic.com/manga/volcanic-age/'

  return searchValid(results, desired, QUERY)
}
