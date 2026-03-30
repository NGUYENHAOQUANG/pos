import { IMaterial } from '@/features/material/types/material.types';
import { documentApi } from '@/features/material/api/documentApi';
import { JobExecution } from '@/features/farm/types/farm.types';

export const dryRenovationService = {
    mapDryRenovationsToJobs: async (
        rawItems: any[],
        materialMap: Record<string, IMaterial>
    ): Promise<JobExecution[]> => {
        const totalPerDay: Record<string, number> = {};
        rawItems.forEach((item: any) => {
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

        return await Promise.all(
            sortedItems.map(async item => {
                const dateObj = item.createdAt ? new Date(item.createdAt) : new Date();
                const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;

                if (!dayCounts[dateKey]) dayCounts[dateKey] = 0;
                dayCounts[dateKey]++;
                const total = totalPerDay[dateKey] ?? dayCounts[dateKey];
                const dailyIndex = total - dayCounts[dateKey] + 1;

                let imageUrls: string[] = [];
                if (item.documents && item.documents.length > 0) {
                    imageUrls = item.documents
                        .map((doc: { publicUrl?: string }) => doc.publicUrl)
                        .filter((url: string | undefined): url is string => !!url);
                } else if (item.documentIds && item.documentIds.length > 0) {
                    imageUrls = await documentApi.getUrls(item.documentIds);
                }

                return {
                    id: item.id,
                    label: `Lần ${dailyIndex}`,
                    date: item.createdAt,
                    time: item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '00:00',
                    note: item.dryRenovationDetail?.notes || undefined,
                    pondId: item.pondId,
                    images: imageUrls,
                    meta: {
                        ...item.dryRenovationDetail,
                        images: imageUrls,
                        documentIds: item.documentIds || [],
                    },
                    materials:
                        item.dryRenovationDetail?.materials?.map((m: any) => {
                            const mat = materialMap[m.warehouseItemId];
                            return {
                                material: {
                                    id: m.warehouseItemId,
                                    name: mat?.name || m.name || 'Vật tư',
                                    group: mat?.group || '',
                                    unit: mat?.unitName || m.unitName || '',
                                } as any,
                                quantity: m.quantity,
                                unit: mat?.unitName || m.unitName || '',
                            };
                        }) || [],
                };
            })
        );
    },
};
