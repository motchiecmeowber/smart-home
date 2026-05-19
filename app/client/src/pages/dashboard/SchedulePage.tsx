import './SchedulePage.css'
import { useState } from 'react'

export function SchedulePage() {
    const [showModal, setShowModal] = useState(false)
    const handleSave = () => {
    setShowModal(false)
}
  return (
    <div className="schedule-page">

      <div className="schedule-header">
        <h1>Lịch trình</h1>

        <button className="add-btn" onClick={() => setShowModal(true)}>
            Thêm lịch trình
        </button>
      </div>
      {showModal && (

        <div className="modal-overlay">

          <div className="schedule-modal">

            <h2>Thêm lịch trình</h2>

            <div className="form-group">
              <label>Thiết bị</label>

              <select>
                <option>Đèn phòng khách</option>
                <option>Đèn phòng ngủ</option>
                <option>Đèn phòng bếp</option>
              </select>
            </div>

            <div className="form-group">
              <label>Thời gian</label>

              <input type="time" />
            </div>

            <div className="form-group">
              <label>Hành động</label>

              <select>
                <option>Bật</option>
                <option>Tắt</option>
              </select>
            </div>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>

              <button className="save-btn"
              onClick={handleSave}>
                Lưu
              </button>

            </div>

          </div>

        </div>

      )}

      <div className="schedule-card">

        <div className="schedule-info">

          <div className="time-box">
            <div className="bulb-icon">💡</div>
            <span>18:00</span>
          </div>

          <div className="schedule-text">
            <h2>Bật đèn phòng khách</h2>
            <p>Hàng ngày</p>
          </div>

        </div>

        <div className="room-section">
          <h3>Phòng ngủ</h3>

          <div className="device-row">
            <div className="device-item">
              Đèn trần: 2
            </div>

            <div className="device-item">
              Nhiệt ẩm kế: 1
            </div>
          </div>
        </div>

        <div className="room-section">
          <h3>Phòng bếp</h3>

          <div className="device-row">
            <div className="device-item">
              Đèn trần: 2
            </div>

            <div className="device-item">
              Nhiệt ẩm kế: 1
            </div>

            <div className="device-item">
              Máy đo khí gas: 1
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}