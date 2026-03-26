import { IApiResponse, ICreatorEditor } from '@/shared/types/common.types';

export interface Metric {
    id: string;
    code: string;
    name: string;
    unitMetric: string;
    unitDisplay?: string;
    description: string;
    no: number;
    creatorId: string | null;
    editorId: string | null;
    createdAt: string;
    editedAt: string;
    creator: ICreatorEditor | null;
    editor: ICreatorEditor | null;
}

export type GetMetricsResponse = IApiResponse<Metric[]>;
