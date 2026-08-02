import { Manga } from 'src/classes/manga'
import type { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'
import moment from 'moment'

const SITE_TYPE = SiteType.HiperDEX
const QUERY = 'cabalist'

export async function testHiperDEX(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 84 - [END]'
  desired.image = 'https://cloud-7.r2d2storage.com/2022/01/10-Years-in-the-Friend-Zone.webp'
  desired.title = '10 Years in the Friend Zone'
  desired.chapterUrl = 'https://hiperdex.com/manga/10-years-in-the-friend-zone/84'
  desired.chapterNum = 84
  desired.chapterDate = moment('01/20/2022', 'MM/DD/YYYY').fromNow()

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://cloud-7.r2d2storage.com/2020/04/Cabalist-1.jpg'
  desired.chapter = 'Chapter 44 - [END]'
  desired.url = 'https://hiperdex.com/manga/cabalist-75e30c62'

  return searchValid(results, desired, QUERY)
}
