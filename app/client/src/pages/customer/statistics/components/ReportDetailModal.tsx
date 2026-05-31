import { useEffect } from "react";
import { CalendarOutlined } from "@ant-design/icons";
import { DatePicker, Form, Modal, Radio, Select } from "antd";
import dayjs from "dayjs";
import type { DeviceInfo } from "../../../../lib/deviceApi";

type ReportDetailModalProps = {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    devices: DeviceInfo[];
    loading: boolean;
}

export function ReportDetailModal({
    open,
    onCancel,
    onSubmit,
    devices,
    loading
}: ReportDetailModalProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                reportType: 'DAILY',
                targetDate: dayjs(),
                sensors: []
            });
        }
    }, [open, devices, form]);

    const handleOk = () => {
        form.submit();
    };

    const handleFinish = (values: any) => {
        onSubmit(values);
    };

    return (
        <Modal
            title={<span style={{ fontSize: '18px', fontWeight: 700, color: '#0b2a3a' }}>Tạo báo cáo thống kê mới</span>}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            centered
            okText="Tạo báo cáo"
            cancelText="Hủy"
            okButtonProps={{ style: { background: '#0b5f95', borderColor: '#0b5f95' } }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    reportType: 'DAILY',
                    targetDate: dayjs()
                }}
                style={{ marginTop: '16px' }}
            >
                <Form.Item
                    name="reportType"
                    label="Loại báo cáo"
                    rules={[{ required: true, message: 'Vui lòng chọn loại báo cáo' }]}
                >
                    <Radio.Group optionType="button" buttonStyle="solid">
                        <Radio.Button value="DAILY">Báo cáo ngày</Radio.Button>
                        <Radio.Button value="WEEKLY">Báo cáo tuần</Radio.Button>
                        <Radio.Button value="MONTHLY">Báo cáo tháng</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="targetDate"
                    label="Ngày mục tiêu"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày thống kê' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        prefix={<CalendarOutlined />}
                        suffixIcon={null}
                    />
                </Form.Item>

                <Form.Item
                    name="sensors"
                    label="Thiết bị cảm biến đưa vào báo cáo"
                    help="Chọn các cảm biến bạn muốn đưa vào báo cáo thống kê này."
                    style={{ marginBottom: '35px' }}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn cảm biến hoạt động"
                        options={devices.map(d => ({
                            value: d.deviceId,
                            label: `${d.deviceName} (${d.location ?? 'Chưa gán phòng'})`
                        }))}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}