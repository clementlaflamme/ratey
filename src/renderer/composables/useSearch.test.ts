import { nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { useSearch } from './useSearch';

vi.mock('@clerk/vue', () => ({ getToken: vi.fn() }));
vi.mock('./api', () => ({
  api: { search: vi.fn() },
  errorMessage: (error: unknown) => (error as Error).message,
}));

const game = (id: number, name: string) => ({
  id,
  name,
  coverImageId: null,
  studio: null,
  releaseYear: null,
});

/** Laisse passer le délai, puis les promesses en attente. */
async function settle(ms = 300) {
  await nextTick();
  await vi.advanceTimersByTimeAsync(ms);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(api.search).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useSearch', () => {
  it('cherche après le délai, avec le texte nettoyé', async () => {
    vi.mocked(api.search).mockResolvedValue([game(1, 'Hades')]);
    const query = ref('');
    const { results, loading } = useSearch(query, { delay: 300 });

    query.value = '  hades ';
    await nextTick();
    expect(loading.value).toBe(true);
    expect(api.search).not.toHaveBeenCalled();

    await settle();
    expect(api.search).toHaveBeenCalledWith('hades');
    expect(results.value).toEqual([game(1, 'Hades')]);
    expect(loading.value).toBe(false);
  });

  it('ne cherche pas sous la longueur minimale', async () => {
    const query = ref('h');
    useSearch(query, { minLength: 2 });

    await settle();
    expect(api.search).not.toHaveBeenCalled();
  });

  it('ne lance que la dernière recherche pendant la frappe', async () => {
    vi.mocked(api.search).mockResolvedValue([]);
    const query = ref('');
    useSearch(query, { delay: 300 });

    query.value = 'ha';
    await settle(100);
    query.value = 'had';
    await settle(100);
    query.value = 'hades';
    await settle();

    expect(api.search).toHaveBeenCalledTimes(1);
    expect(api.search).toHaveBeenCalledWith('hades');
  });

  it('ignore une réponse arrivée après une recherche plus récente', async () => {
    let answerOld!: (value: ReturnType<typeof game>[]) => void;
    vi.mocked(api.search)
      .mockImplementationOnce(
        () => new Promise((resolve) => (answerOld = resolve)),
      )
      .mockResolvedValueOnce([game(2, 'Celeste')]);
    const query = ref('hades');
    const { results } = useSearch(query);
    await settle(0);

    query.value = 'celeste';
    await settle(0);
    answerOld([game(1, 'Hades')]);
    await settle(0);

    expect(results.value).toEqual([game(2, 'Celeste')]);
  });

  it("expose le message d'erreur", async () => {
    vi.mocked(api.search).mockRejectedValue(new Error('Serveur injoignable'));
    const { error, results } = useSearch(ref('hades'));

    await settle(0);
    expect(error.value).toBe('Serveur injoignable');
    expect(results.value).toEqual([]);
  });
});
