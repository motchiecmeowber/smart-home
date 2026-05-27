import { useEffect } from "react";
import { Form, InputNumber, Modal, Select, Row, Col, type FormInstance } from "antd";
import type { DeviceInfo } from "../../../../lib/deviceApi";

type AddScheduleModalProps = {
    open: boolean
    form: FormInstance
    actuators: DeviceInfo[]
    initialData?: any | null
    onCancel: () => void
    onAdd: (values: any) => void
}

export function AddScheduleModal({
    open,
    form,
    actuators,
    initialData,
    onCancel,
    onAdd
}: AddScheduleModalProps) {
    useEffect(() => {
        if (open && initialData) {
            // Tách giờ và phút từ startTime nếu có
            let startHour = undefined;
            let startMinute = undefined;
            
            if (initialData.startTime) {
                const date = new Date(initialData.startTime);
                if (!isNaN(date.getTime())) {
                    startHour = date.getHours();
                    startMinute = date.getMinutes();
                }
            }

            form.setFieldsValue({
                actuatorId: initialData.actuatorId,
                action: initialData.action,
                frequency: initialData.frequency,
                duration: initialData.duration,
                startHour: startHour,
                startMinute: startMinute
            });
        } else if (open && !initialData) {
            form.resetFields();
        }
    }, [open, initialData, form]);

    return (
        <Modal
            title={initialData ? 'Cập nhật lịch trình' : 'Thêm lịch trình mới'}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText='Lưu lịch trình'
            cancelText='Hủy'
            destroyOnHidden
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onAdd}
                initialValues={{
                    action: 'ON',
                    frequency: 'DAILY',
                }}
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    name='actuatorId'
                    label='Chọn thiết bị'
                    rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
                >
                    <Select
                        placeholder="Chọn thiết bị cần đặt lịch trình"
                        style={{ width: '100%' }}
                        allowClear
                        options={actuators.map(act => ({
                            label: `${act.deviceName || act.serial} - ${act.location || 'Chưa có vị trí'}`,
                            value: act.deviceId
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name='action'
                    label='Hành động'
                    rules={[{ required: true }]}
                >
                    <Select
                        style={{ width: '100%' }}
                        options={[
                            {label: 'BẬT', value: 'ON'},
                            {label: 'TẮT', value: 'OFF'}
                        ]}
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label='Thời gian thực thi' required>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Form.Item
                                    name="startHour"
                                    noStyle
                                    rules={[{ required: true, message: 'Thiếu giờ' }]}
                                >
                                    <InputNumber 
                                        min={0} max={23} 
                                        placeholder="hh" 
                                        controls={false} 
                                        formatter={(value) => (value !== undefined && value !== null ? String(value).padStart(2, '0') : '')}
                                        style={{ width: '100%', textAlign: 'center' }} 
                                    />
                                </Form.Item>
                                
                                <span style={{ fontWeight: 'bold' }}>:</span>
                                
                                <Form.Item
                                    name="startMinute"
                                    noStyle
                                    rules={[{ required: true, message: 'Thiếu phút' }]}
                                >
                                    <InputNumber 
                                        min={0} max={59} 
                                        placeholder="mm" 
                                        controls={false} 
                                        formatter={(value) => (value !== undefined && value !== null ? String(value).padStart(2, '0') : '')}
                                        style={{ width: '100%', textAlign: 'center' }} 
                                    />
                                </Form.Item>
                            </div>
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item
                            name='duration'
                            label='Thời lượng (Phút)'
                            rules={[{ required: false }]}
                        >
                            <InputNumber controls={false} min={1} placeholder="Ví dụ: 30 phút" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name='frequency'
                    label='Tần suất'
                    rules={[{ required: true }]}
                >
                    <Select
                        style={{ width: '100%' }}
                        options={[
                            {label: 'Chỉ một lần', value: 'ONCE'},
                            {label: 'Hàng ngày', value: 'DAILY'},
                            {label: 'Hàng tuần', value: 'WEEKLY'}
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}