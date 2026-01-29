export const farmKeys = {
    all: ['farm'] as const,
    zones: () => [...farmKeys.all, 'zones'] as const,
    ponds: {
        all: () => [...farmKeys.all, 'ponds'] as const,
        byZone: (zoneId: number | string) => [...farmKeys.ponds.all(), 'byZone', zoneId] as const,
        detail: (id: string) => [...farmKeys.ponds.all(), 'detail', id] as const,
    },
    masterData: {
        types: () => [...farmKeys.all, 'master', 'types'] as const,
        operations: () => [...farmKeys.all, 'master', 'operations'] as const,
    },
    seasons: (zoneId?: number | string) =>
        [...farmKeys.all, 'seasons', ...(zoneId ? [zoneId] : [])] as const,
    detail: (zoneId: string, id: string) => [...farmKeys.seasons(zoneId), 'detail', id] as const,
    cycles: {
        all: () => [...farmKeys.all, 'cycles'] as const,
        byPond: (pondId: string) => [...farmKeys.cycles.all(), 'byPond', pondId] as const,
        detail: (id: string) => [...farmKeys.cycles.all(), 'detail', id] as const,
    },
    sizeMeasurements: {
        all: () => [...farmKeys.all, 'sizeMeasurements'] as const,
        byPond: (pondId: string, params?: any) =>
            [
                ...farmKeys.sizeMeasurements.all(),
                'byPond',
                pondId,
                ...(params ? [params] : []),
            ] as const,
        detail: (id: string) => [...farmKeys.sizeMeasurements.all(), 'detail', id] as const,
    },
    shrimpHealthChecks: {
        all: () => [...farmKeys.all, 'shrimpHealthChecks'] as const,
        byPond: (pondId: string) =>
            [...farmKeys.shrimpHealthChecks.all(), 'byPond', pondId] as const,
        detail: (id: string) => [...farmKeys.shrimpHealthChecks.all(), 'detail', id] as const,
    },
};
