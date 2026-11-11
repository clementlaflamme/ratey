import type { Platform } from './types';

export type PlatformFamily =
  | 'playstation'
  | 'xbox'
  | 'nintendo'
  | 'pc'
  | 'mobile'
  | 'other';

/** Ordre d'affichage des familles et leur libellé. */
export const PLATFORM_FAMILIES: Record<PlatformFamily, string> = {
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  pc: 'PC',
  mobile: 'Mobile',
  other: 'Autres',
};

/** Famille de chaque ID de plateforme IGDB connu. */
const FAMILY_BY_IGDB_ID: Record<number, PlatformFamily> = {
  // PlayStation : PS1, PS2, PS3, PSP, Vita, PS4, PS5
  7: 'playstation',
  8: 'playstation',
  9: 'playstation',
  38: 'playstation',
  46: 'playstation',
  48: 'playstation',
  167: 'playstation',
  // Xbox : Xbox, 360, One, Series X|S
  11: 'xbox',
  12: 'xbox',
  49: 'xbox',
  169: 'xbox',
  // Nintendo : N64, Wii, DS, GameCube, 3DS, Wii U, Switch, Switch 2
  4: 'nintendo',
  5: 'nintendo',
  20: 'nintendo',
  21: 'nintendo',
  37: 'nintendo',
  41: 'nintendo',
  130: 'nintendo',
  508: 'nintendo',
  // PC : Linux, Windows, Mac
  3: 'pc',
  6: 'pc',
  14: 'pc',
  // Mobile : Android, iOS
  34: 'mobile',
  39: 'mobile',
};

export function platformFamily(id: number): PlatformFamily {
  return FAMILY_BY_IGDB_ID[id] ?? 'other';
}

export interface PlatformGroup {
  family: PlatformFamily;
  label: string;
  /** Noms exacts des plateformes de la famille */
  names: string[];
}

/** Une entrée par famille, sans doublon, dans l'ordre de PLATFORM_FAMILIES. */
export function groupPlatforms(platforms: readonly Platform[]) {
  const names = new Map<PlatformFamily, string[]>();
  for (const platform of platforms) {
    const family = platformFamily(platform.id);
    names.set(family, [...(names.get(family) ?? []), platform.name]);
  }
  return (Object.keys(PLATFORM_FAMILIES) as PlatformFamily[]).flatMap(
    (family): PlatformGroup[] => {
      const list = names.get(family);
      return list
        ? [{ family, label: PLATFORM_FAMILIES[family], names: list }]
        : [];
    },
  );
}
