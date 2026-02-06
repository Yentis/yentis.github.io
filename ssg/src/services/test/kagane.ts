import { Manga } from 'src/classes/manga'
import type { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'
import moment from 'moment'

const SITE_TYPE = SiteType.Kagane
const QUERY = 'the girl I like forgot her glasses'

export async function testKagane(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 110.2'
  desired.image = 'https://api.kagane.org/api/v1/series/3MABGJX6J2FLZRTX0B4PRYJSU5/thumbnail'
  desired.title = 'The Girl I Like Forgot Her Glasses'
  desired.chapterUrl = 'https://kagane.org/series/3MABGJX6J2FLZRTX0B4PRYJSU5/reader/37A2GKX6JAFLZRTXIB4PSY0S55'
  desired.chapterNum = 120
  desired.chapterDate = moment('2025-08-02', 'YYYY-MM-DD').fromNow()

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://api.kagane.org/api/v1/series/3MABGJX6J2FLZRTX0B4PRYJSU5/thumbnail'
  desired.chapter = '120'
  desired.url = 'https://kagane.org/series/3MABGJX6J2FLZRTX0B4PRYJSU5'

  return searchValid(results, desired, QUERY)
}
