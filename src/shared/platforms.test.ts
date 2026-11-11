import { describe, expect, it } from 'vitest';
import { groupPlatforms, platformFamily } from './platforms';

describe('platformFamily', () => {
  it('reconnaît les familles', () => {
    expect(platformFamily(167)).toBe('playstation');
    expect(platformFamily(169)).toBe('xbox');
    expect(platformFamily(130)).toBe('nintendo');
    expect(platformFamily(6)).toBe('pc');
    expect(platformFamily(39)).toBe('mobile');
  });

  it('classe les plateformes inconnues dans « other »', () => {
    expect(platformFamily(99999)).toBe('other');
  });
});

describe('groupPlatforms', () => {
  it('regroupe par famille, sans doublon, dans un ordre fixe', () => {
    const groups = groupPlatforms([
      { id: 39, name: 'iOS' },
      { id: 48, name: 'PlayStation 4' },
      { id: 6, name: 'PC (Windows)' },
      { id: 167, name: 'PlayStation 5' },
      { id: 99999, name: 'Ouya' },
    ]);
    expect(groups).toEqual([
      {
        family: 'playstation',
        label: 'PlayStation',
        names: ['PlayStation 4', 'PlayStation 5'],
      },
      { family: 'pc', label: 'PC', names: ['PC (Windows)'] },
      { family: 'mobile', label: 'Mobile', names: ['iOS'] },
      { family: 'other', label: 'Autres', names: ['Ouya'] },
    ]);
  });

  it('renvoie une liste vide sans plateforme', () => {
    expect(groupPlatforms([])).toEqual([]);
  });
});
