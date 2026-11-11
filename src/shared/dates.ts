// En UTC : une date AAAA-MM-JJ ne doit pas reculer d'un jour selon le fuseau.
const longDate = new Intl.DateTimeFormat('fr-CA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Date de sortie en toutes lettres. Ex. : « 18 novembre 2011 ». */
export function formatReleaseDate(date: string) {
  return longDate.format(new Date(`${date}T00:00:00Z`));
}

/** Année d'une date AAAA-MM-JJ (null si absente). */
export function releaseYear(date: string | null) {
  return date ? Number(date.slice(0, 4)) : null;
}
