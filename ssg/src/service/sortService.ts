import { Manga } from 'src/classes/manga'
import { SortType } from 'src/enums/sorting'
import { Status } from 'src/enums/status'

export function mangaSort (a: Manga, b: Manga, sortedBy: SortType): number {
  if ((a.status !== Status.READING || undefined) && (b.status === Status.READING || undefined)) {
    return 1
  }
  if ((b.status !== Status.READING || undefined) && (a.status === Status.READING || undefined)) {
    return -1
  }

  if (a.status === Status.DROPPED && b.status !== Status.DROPPED) {
    return 1
  }
  if (b.status === Status.DROPPED && a.status !== Status.DROPPED) {
    return -1
  }

  if (a.status === Status.PLAN_TO_READ && b.status !== Status.PLAN_TO_READ) {
    return 1
  }
  if (b.status === Status.PLAN_TO_READ && a.status !== Status.PLAN_TO_READ) {
    return -1
  }

  if (a.status === Status.ON_HOLD && b.status !== Status.ON_HOLD) {
    return 1
  }
  if (b.status === Status.ON_HOLD && a.status !== Status.ON_HOLD) {
    return -1
  }

  switch (sortedBy) {
    case SortType.SITE:
      return sortSite(a, b)
    case SortType.PROGRESS:
      return sortProgress(a, b)
    case SortType.RATING:
      return sortRating(a, b)
    default:
      return sortTitle(a, b)
  }
}

function sortSite (a: Manga, b: Manga) {
  return a.site.toLowerCase() > b.site.toLowerCase() ? 1 : b.site.toLowerCase() > a.site.toLowerCase() ? -1 : sortTitle(a, b)
}

function sortProgress (a: Manga, b: Manga) {
  if (a.readNum && b.readNum) {
    return a.readNum > b.readNum ? 1 : b.readNum > a.readNum ? -1 : sortTitle(a, b)
  } else if (a.read && b.read) {
    return a.read.toLowerCase() > b.read.toLowerCase() ? 1 : b.read.toLowerCase() > a.read.toLowerCase() ? -1 : sortTitle(a, b)
  } else {
    return sortTitle(a, b)
  }
}

function sortRating (a: Manga, b: Manga) {
  if (a.rating && b.rating) {
    return b.rating - a.rating
  }
  if (a.rating) {
    return -1
  }
  if (b.rating) {
    return 1
  }

  return sortTitle(a, b)
}

function sortTitle (a: Manga, b: Manga) {
  return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : b.title.toLowerCase() > a.title.toLowerCase() ? -1 : 0
}
