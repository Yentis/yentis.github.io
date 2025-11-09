import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { EqualityOptions, mangaEqual, searchValid } from '../testService'
import moment from 'moment'

const SITE_TYPE = SiteType.Tapas
const QUERY = 'mystic musketeer'
const EQUALITY_OPTIONS: EqualityOptions = {
  chapterEqual: (desired, actual) => actual.startsWith(desired),
  chapterUrlEqual: (_, actual) => actual.startsWith('https://tapas.io/episode/'),
  imageEqual: (_, actual) => actual.startsWith('https://us-a.tapas.io/sa/'),
};

export async function testTapas(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await readUrlReverseOrder()
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  const chapter = 180

  desired.title = 'Villains Are Destined to Die'
  desired.chapter = `${chapter}.`
  desired.chapterNum = chapter + 12
  desired.chapterDate = moment('Nov 05, 2025', 'MMM DD, YYYY').fromNow()

  mangaEqual(manga, desired, EQUALITY_OPTIONS)
}

async function readUrlReverseOrder(): Promise<void> {
  const manga = await getMangaInfo('https://tapas.io/series/mystic-musketeer/info', SITE_TYPE)
  const desired = new Manga('https://tapas.io/series/mystic-musketeer/info', SITE_TYPE)
  const chapter = 175

  desired.title = 'Mystic Musketeer'
  desired.chapter = `Episode ${chapter}`
  desired.chapterNum = chapter
  desired.chapterDate = moment('Aug 17, 2025', 'MMM DD, YYYY').fromNow()

  mangaEqual(manga, desired, EQUALITY_OPTIONS)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://us-a.tapas.io/sa/32/f137786b-242f-4257-aeac-070175da5dd6_z.jpg'
  desired.chapter = 'Episode 175 (Season 4 Finale)'
  desired.url = 'https://tapas.io/series/mystic-musketeer/info'

  return searchValid(results, desired, QUERY)
}
