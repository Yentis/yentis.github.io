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
  await readUrl2()
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 84 - [END]'
  desired.image =
    'https://i0.wp.com/hiperdex.com/wp-content/uploads/2022/01/10-Years-in-the-Friend-Zone.webp?resize=193%2C278&ssl=1'
  desired.title = '10 Years in the Friend Zone'
  desired.chapterUrl = 'https://hiperdex.com/manga/10-years-in-the-friend-zone/chapter-84/'
  desired.chapterNum = 84
  desired.chapterDate = moment('01/20/2022', 'MM/DD/YYYY').fromNow()

  mangaEqual(manga, desired)
}

async function readUrl2(): Promise<void> {
  const manga = await getMangaInfo('https://hiperdex.com/manga/touch-on/', SITE_TYPE)
  const desired = new Manga('https://hiperdex.com/manga/touch-on/', SITE_TYPE)
  const chapterNum = 110

  desired.chapter = `Chapter ${chapterNum}`
  desired.image =
    'https://i0.wp.com/hiperdex.com/wp-content/uploads/2020/06/Touch-to-Unlock-Manhwa.jpg?resize=193%2C278&ssl=1'
  desired.title = 'Touch to Unlock'
  desired.chapterUrl = `https://hiperdex.com/manga/touch-to-unlock/chapter-${chapterNum}/`
  desired.chapterNum = chapterNum
  desired.chapterDate = moment('10/25/2025', 'MM/DD/YYYY').fromNow()

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://i0.wp.com/hiperdex.com/wp-content/uploads/2020/04/Cabalist-1.jpg?resize=350%2C476&ssl=1'
  desired.chapter = 'Chapter 44'
  desired.url = 'https://hiperdex.com/manga/cabalist-75e30c62/'

  return searchValid(results, desired, QUERY)
}
