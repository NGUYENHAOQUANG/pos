import { IMaterial } from '@/features/material/types/material.types';
import { JobExecution } from '@/features/farm/types/farm.types';
import { IncidentListItem } from '@/features/farm/types/incident.types';
import { formatDate } from '@/features/farm/utils/dateUtils';

export const incidentService = {
    mapIncidentsToJobs: (
        rawItems: IncidentListItem[],
        materialMap: Record<string, IMaterial>
    ): JobExecution[] => {
        const totalPerDay: Record<string, number> = {};
        rawItems.forEach(item => {
            const d = item.createdAt ? new Date(item.createdAt) : new Date();
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            totalPerDay[key] = (totalPerDay[key] || 0) + 1;
        });

        const sortedItems = [...rawItems].sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        const dayCounts: Record<string, number> = {};
        return sortedItems.map(item => {
            const createdDate = item.createdAt ? new Date(item.createdAt) : new Date();
            const dateKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}-${createdDate.getDate()}`;

            if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
            dayCounts[dateKey]++;
            const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
            const dailyIndex = total - dayCounts[dateKey] + 1;

            const timeStr = createdDate.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const dateStr = formatDate(createdDate);

            return {
                id: item.id,
                label: `Lần ${dailyIndex}`,
                time: timeStr,
                date: dateStr,
                note: item.detail?.notes ?? undefined,
                pondId: item.pondId,
                materials:
                    item.detail?.materials?.map(m => {
                        const mat = materialMap[m.warehouseItemId];
                        return {
                            material: {
                                id: m.warehouseItemId,
                                name: mat?.name || m.name || 'Vật tư',
                                unitName: mat?.unitName || m.unitName || '',
                            } as any,
                            quantity: m.quantity,
                            unit: mat?.unitName || m.unitName || '',
                        };
                    }) || [],
                documentIds: item.documentIds,
                images: item.documentIds ?? [],
                createdAt: item.createdAt,
            };
        });
    },
};
