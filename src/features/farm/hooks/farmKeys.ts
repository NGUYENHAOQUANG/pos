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
};
