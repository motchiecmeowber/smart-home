export interface Device {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    macAddress?: string;
    status: 'active' | 'inactive' | 'error';
}