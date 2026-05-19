
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import './Home.css'

const lineData = [
  { time: '00:00', temp: 24, humidity: 72, gas: 1 },
  { time: '04:00', temp: 24, humidity: 70, gas: 1 },
  { time: '08:00', temp: 25, humidity: 68, gas: 1 },
  { time: '12:00', temp: 29, humidity: 64, gas: 2 },
  { time: '16:00', temp: 24, humidity: 66, gas: 1 },
  { time: '20:00', temp: 21, humidity: 73, gas: 2 },
]

const pieData = [
  { name: 'Đã phê duyệt', value: 15 },
  { name: 'Đang chờ', value: 3 },
  { name: 'Từ chối', value: 1 },
]

const COLORS = ['#0b5f95', '#4f8db7', '#b6d0e2']

export function DashboardPage() {
  return (
    <div className="dashboard-page">

      <div className="top-section">

        <div className="chart-card">
          <h3>Báo cáo thống kê</h3>

          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color temp"></span>
              <span>Nhiệt độ</span>
            </div>

            <div className="legend-item">
              <span className="legend-color humidity"></span>
              <span>Độ ẩm</span>
            </div>

            <div className="legend-item">
              <span className="legend-color gas"></span>
              <span>Gas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <XAxis dataKey="time" />
              <YAxis />

              <Tooltip />

              <Legend
                verticalAlign="top"
                height={36}
              />

              <Line
                type="monotone"
                dataKey="temp"
                stroke="red"
                name="Nhiệt độ"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#00a2ff"
                name="Độ ẩm"
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="gas"
                stroke="orange"
                name="Gas"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pie-card">
          <h3>Yêu cầu của tôi</h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                label
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend
                verticalAlign="bottom"
                height={36}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            <div className="legend-item">
              <span className="legend-color approved"></span>
              <span>Đã phê duyệt</span>
            </div>

            <div className="legend-item">
              <span className="legend-color waiting"></span>
              <span>Đang chờ</span>
            </div>

            <div className="legend-item">
              <span className="legend-color rejected"></span>
              <span>Từ chối</span>
            </div>
          </div>
        </div>

      </div>

      <div className="activity-card">
        <h3>Nhật ký hoạt động</h3>

        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Nội dung</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>19:30</td>
              <td>🟢</td>
              <td>Đèn phòng khách đã bật</td>
            </tr>

            <tr>
              <td>18:00</td>
              <td>🔵</td>
              <td>Hệ thống bật đèn sân vườn</td>
            </tr>

            <tr>
              <td>17:45</td>
              <td>🔵</td>
              <td>Bật quạt phòng khách</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}