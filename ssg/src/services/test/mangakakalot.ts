import { Manga } from 'src/classes/manga'
import { BaseSite } from 'src/classes/sites/baseSite'
import { SiteType } from 'src/enums/siteEnum'
import { getMangaInfo, getSite, searchManga } from '../siteService'
import { mangaEqual, searchValid } from '../testService'

const SITE_TYPE = SiteType.Mangakakalot
const QUERY = 'together with the rain'

export async function testMangakakalot(): Promise<void> {
  const site = getSite(SITE_TYPE)
  if (!site) throw Error('Site not found')

  await readUrl(site)
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 24: I Want to Get Along With My Childhood Friend [END]'
  desired.image = 'https://avt.mkklcdnv6temp.com/fld/74/s/8-1732791228-nw.webp'
  desired.title = 'Osananajimi ni najimitai'
  desired.chapterUrl = 'https://mangakakalot.com/chapter/osananajimi_ni_najimitai/chapter_24'
  desired.chapterNum = 24
  desired.chapterDate = '5 years ago'

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://avt.mkklcdnv6temp.com/fld/33/v/11-1732805839-nw.webp'
  desired.chapter = "Chapter 2: That’s What's Unfair About You! [END]"
  desired.url = 'https://mangakakalot.com/manga/pg923760'

  await searchValid(results, desired, QUERY)

  const query2 = 'this song is only for you'
  const results2 = await searchManga(query2, SITE_TYPE)
  const desired2 = new Manga('https://chapmanganato.to/manga-hv985178', SITE_TYPE)
  desired2.image = 'https://avt.mkklcdnv6temp.com/fld/95/g/10-1732803718-nw.webp'
  desired2.chapter = 'Chapter 149.2'

  return searchValid(results2, desired2, query2)
}
