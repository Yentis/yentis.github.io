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
  await readUrlAlt()
  await search(site)
}

async function readUrl(site: BaseSite): Promise<void> {
  const manga = await getMangaInfo(site.getTestUrl(), SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.chapter = 'Chapter 110.2'
  desired.image = 'https://kagane.to/api/v2/image/019c29bc-0809-70e8-b5c3-9fd032cfb619/compressed'
  desired.title = 'The Girl I Like Forgot Her Glasses'
  desired.chapterUrl =
    'https://kagane.to/series/019c29bc-0812-7957-a697-94a6f70f09d6/reader/019c29e1-91b3-7174-b5ad-42e54ac5f310'
  desired.chapterNum = 120
  desired.chapterDate = moment('2025-08-02', 'YYYY-MM-DD').fromNow()

  mangaEqual(manga, desired)
}

async function readUrlAlt(): Promise<void> {
  const url = 'https://kagane.to/series/019c2a33-d3b2-777b-871b-a093e2cf7701'
  const manga = await getMangaInfo(url, SITE_TYPE)
  const desired = new Manga(url, SITE_TYPE)

  desired.chapter = 'CHAPTER 71 A FEMALE KNIGHT AND A LIBRARY'
  desired.image = 'https://kagane.to/api/v2/image/019c2a33-d384-76ce-9c63-66887baf4394/compressed'
  desired.title = 'All My Neighbors are Convinced the Female Knight from My Rice Field Is My Wife'
  desired.chapterUrl =
    'https://kagane.to/series/019c2a33-d3b2-777b-871b-a093e2cf7701/reader/019e24dd-041a-7792-ba0a-242ab5b5586a'
  desired.chapterNum = 71
  desired.chapterDate = moment('2026-05-14T05:02:04.825819Z').fromNow()

  mangaEqual(manga, desired)
}

async function search(site: BaseSite): Promise<void> {
  const results = await searchManga(QUERY, SITE_TYPE)
  const desired = new Manga(site.getTestUrl(), SITE_TYPE)
  desired.image = 'https://kagane.to/api/v2/image/019c29bc-0809-70e8-b5c3-9fd032cfb619/compressed'
  desired.title = 'The Girl I Like Forgot Her Glasses (Manga Up!)'
  desired.chapter = '120'
  desired.url = 'https://kagane.to/series/019c29bc-0812-7957-a697-94a6f70f09d6'

  return searchValid(results, desired)
}
