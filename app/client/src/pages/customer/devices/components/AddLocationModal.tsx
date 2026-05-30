import { Form, Input, Modal } from "antd";

type AddLocationModalProps = {
    open: boolean
    onCancel: () => void
    onAdd: (values: { locationName: string }) => void
}

export function AddLocationModal({ open, onCancel, onAdd }: AddLocationModalProps) {
    const [form] = Form.useForm()

    const handleOk = () => {
        form.validateFields().then(values => {
            onAdd(values)
            form.resetFields()
        })
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            title="Thêm khu vực mới"
            open={open}
            onCancel={handleCancel}
            onOk={handleOk}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnHidden
            centered
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="locationName"
                    label="Tên khu vực"
                    rules={[{ required: true, message: 'Vui lòng nhập tên khu vực!' }]}
                >
                    <Input placeholder="Ví dụ: Phòng khách, Sân vườn..." />
                </Form.Item>
            </Form>
        </Modal>
    )
}