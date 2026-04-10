/**
 * @file types.ts
 */
export type WidgetType = 'POND_STATUS' | 'DEVICE_CONTROL';

export interface PondStatusData {
    pond_id: number;
    pond_name?: string;
    temperature: number; // °C
    ph: number;
    oxygen: number;
    salinity?: number;
    turbidity?: number;
}
export interface DeviceControlData {
    device_id: string;
    device_name?: string;
    status: 'ON' | 'OFF';
    device_type?: 'FAN' | 'PUMP' | 'AERATOR' | 'FEEDER';
}
export type WidgetData = PondStatusData | DeviceControlData;
export interface ChatWidget {
    type: WidgetType;
    data: WidgetData;
}
export interface IChatUser {
    _id: number | string;
    name?: string;
    avatar?: string;
}
export interface IQuickReply {
    title: string;
    value: string;
}
export interface QuickReplies {
    type: 'radio' | 'checkbox';
    values: IQuickReply[];
    keepIt?: boolean;
}
export interface IChatMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: IChatUser;
    widget?: ChatWidget;
    quickReplies?: QuickReplies;
}
export interface AIResponse {
    text: string;
    widget?: ChatWidget;
    quickReplies?: QuickReplies;
}
