// ── Enums ────────────────────────────────────────────────────────────────────

export enum ShrimpHealthStatusLabel {
    Healthy = 'Khỏe mạnh',
    Infected = 'Nhiễm bệnh',
}

// ── Request ──────────────────────────────────────────────────────────────────

export interface AIPredictRequest {
    documentId?: string;
    image_base?: string;
}

// ── Seedstock Counting ───────────────────────────────────────────────────────

export interface SeedstockCountingDetection {
    id: number;
    center: { x: number; y: number };
    dimensions: { width: number; height: number };
    angleDegree: number;
    corners: number[][];
}

export interface SeedstockCountingResponse {
    statusCode?: number;
    message?: string;
    datetime?: string;
    imageUrl?: string;
    device?: string;
    executionProvider?: string[];
    totalCount: number;
    executionTimeSec?: number;
    detections: SeedstockCountingDetection[];
}

// ── Estimated Size ───────────────────────────────────────────────────────────

export interface EstimatedSizeObject {
    id: number;
    lengthCm: number;
    confidence: number;
    bbox: number[];
}

export interface ReferenceObject {
    detected: boolean;
    shape: string;
    bbox: number[][];
    sidePx: number;
    sideRealCm: number;
}

export interface ScaleInfo {
    pixelsPerCm: number;
    source: string;
    referenceObject?: ReferenceObject;
}

export interface EstimatedSizeMetaData {
    pipelineTimeSec?: number;
    timestamp?: string;
    totalTimeSec?: number;
}

export interface EstimatedSizeResponse {
    status?: string;
    metaData?: EstimatedSizeMetaData;
    scaleInfo?: ScaleInfo;
    results?: {
        count: number;
        objects: EstimatedSizeObject[];
    };
}

// ── Shrimp Health ────────────────────────────────────────────────────────────

export interface ShrimpHealthResult {
    id: number;
    bbox: number[];
    segConf: number;
    prediction: {
        top1Class: string;
        top1Conf: number;
        allClasses: Record<string, number>;
    };
}

export interface ShrimpHealthResponse {
    statusCode?: number;
    message?: string;
    datetime?: string;
    imageUrl?: string;
    device?: string;
    executionProvider?: string[];
    metaData?: {
        totalPipelineTime?: string;
        segmentTime?: string;
        classifierTime?: string;
        numDetections?: number;
    };
    results: ShrimpHealthResult[];
}

// ── Inference (new flow) ────────────────────────────────────────────────────

export interface InferencePredictRequest {
    Image: {
        uri: string;
        type: string;
        name: string;
    };
    ZoneId: string;
    ModuleId: string;
    ClientTimestamp: string;
}

export interface InferencePredictResponse {
    requestId: string;
    imageId: string;
    status: string;
    message: string;
}

export interface ShrimpAnnotation {
    id: number;
    bbox: number[]; // [x_min, y_min, x_max, y_max]
    length_cm: number;
    confidence: number;
}

export interface InferenceResultResponse {
    id: string;
    requestId: string;
    imageId: string;
    zoneId: string;
    moduleId: string;
    env: string;
    documentId: string;
    clientTimestamp: string;
    status: string;
    totalPipelineTime: number;
    imageRawUrl: string;
    imageProcessedUrl: string;
    annotationJson: string;
    processedAt: string;
    createdAt: string;
}
