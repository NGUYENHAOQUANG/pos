/**
 * React Query keys for the control feature
 */
export const controlKeys = {
    all: ['control'] as const,
    devices: {
        all: () => [...controlKeys.all, 'devices'] as const,
        list: () => [...controlKeys.devices.all(), 'list'] as const,
    },
    schedules: {
        all: () => [...controlKeys.all, 'schedules'] as const,
        byDevice: (deviceId: string) =>
            [...controlKeys.schedules.all(), 'byDevice', deviceId] as const,
    },
};
