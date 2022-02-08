import moment from 'moment'
import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'

const SITE_TYPE = SiteType.ResetScans
const QUERY = 'zoo in the dorm'

export async function testResetScans (): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await readUrlDotChapter()
  await search(site)
}

async function readUrl (site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 4'
  desired.image = 'https://reset-scans.com/wp-content/uploads/2021/04/truth-weaver-cover.png'
  desired.title = 'Madou no Keifu'
  desired.chapterUrl = 'https://reset-scans.com/manga/madou-no-keifu/chapter-04/'
  desired.chapterNum = 4

  mangaEqual(manga, desired)
}

async function readUrlDotChapter (): Promise<void> {
  const manga = await getMangaInfo('https://reset-scans.com/manga/the-unwanted-undead-adventurer/', SITE_TYPE)
  const desired = new Manga('https://reset-scans.com/manga/the-unwanted-undead-adventurer/', SITE_TYPE)
  desired.chapter = 'Chapter 40.3'
  desired.image = 'https://reset-scans.com/wp-content/uploads/2021/06/Undead-Cover-Page.jpg'
  desired.title = 'The Unwanted Undead Adventurer'
  desired.chapterUrl = 'https://reset-scans.com/manga/the-unwanted-undead-adventurer/chapter-40-3/'
  desired.chapterNum = 40.3
  desired.chapterDate = moment('25/12/2021', 'DD/MM/YYYY').fromNow()

  mangaEqual(manga, desired)
}

async function search (site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://reset-scans.com/wp-content/uploads/2021/05/Zoo-Dorm-193x278.png'
  desired.chapter = 'Chapter 18'
  desired.url = 'https://reset-scans.com/manga/zoo-in-the-dormitory/'

  return searchValid(results, desired, QUERY)
}