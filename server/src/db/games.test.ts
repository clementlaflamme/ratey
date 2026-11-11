import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchIgdbGame } from '../igdb/games';
import { prisma } from './client';
import { ensureGameSaved, findSavedGame } from './games';

vi.mock('../igdb/games', () => ({ fetchIgdbGame: vi.fn() }));

// Prisma simulé : la transaction appelle la fonction avec le même client.
const tx = {
  company: { upsert: vi.fn() },
  genre: { upsert: vi.fn() },
  platform: { upsert: vi.fn() },
  game: { upsert: vi.fn(), findUnique: vi.fn() },
};
vi.mock('./client', () => ({
  prisma: {
    game: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$transaction).mockImplementation(((
    fn: (client: typeof tx) => Promise<unknown>,
  ) => fn(tx)) as never);
});

const hades = {
  id: 113112,
  name: 'Hades',
  cover: { image_id: 'co39vc' },
  first_release_date: 1600300800,
  genres: [{ id: 12, name: 'Role-playing (RPG)' }],
  platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }],
  involved_companies: [
    { company: { id: 1, name: 'Supergiant Games' }, developer: true },
  ],
};

describe('ensureGameSaved', () => {
  it('ne fait rien si le jeu est déjà en base', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 1 } as never);

    await ensureGameSaved(1);

    expect(fetchIgdbGame).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('copie le jeu IGDB avec ses relations', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);
    vi.mocked(fetchIgdbGame).mockResolvedValue(hades);

    await ensureGameSaved(113112);

    expect(tx.company.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
    expect(tx.genre.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 12 } }),
    );
    expect(tx.platform.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 6 } }),
    );
    expect(tx.game.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          id: 113112,
          name: 'Hades',
          coverImageId: 'co39vc',
          releaseDate: new Date('2020-09-17T00:00:00Z'),
          developerId: 1,
          genres: { create: [{ genreId: 12 }] },
          platforms: { create: [{ platformId: 6 }] },
        },
      }),
    );
  });

  it("lance une 404 si le jeu n'existe pas sur IGDB", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);
    vi.mocked(fetchIgdbGame).mockResolvedValue(null);

    await expect(ensureGameSaved(999)).rejects.toMatchObject({ status: 404 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('findSavedGame', () => {
  it('convertit le jeu en base vers GameDetails', async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue({
      id: 113112,
      name: 'Hades',
      coverImageId: 'co39vc',
      releaseDate: new Date('2020-09-17T00:00:00Z'),
      developer: { id: 1, name: 'Supergiant Games' },
      genres: [{ genre: { id: 12, name: 'Role-playing (RPG)' } }],
      platforms: [{ platform: { id: 6, name: 'PC (Microsoft Windows)' } }],
    } as never);

    expect(await findSavedGame(113112)).toEqual({
      id: 113112,
      name: 'Hades',
      coverImageId: 'co39vc',
      studio: 'Supergiant Games',
      releaseDate: '2020-09-17',
      genres: ['Role-playing (RPG)'],
      platforms: [{ id: 6, name: 'PC (Microsoft Windows)' }],
    });
  });

  it("renvoie null si le jeu n'est pas en base", async () => {
    vi.mocked(prisma.game.findUnique).mockResolvedValue(null);

    expect(await findSavedGame(1)).toBeNull();
  });
});
