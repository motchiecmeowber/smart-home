// import { analyticsRepo } from "./analytics.repository";
// import { ReportType } from "@prisma/client";

// export class AnalyticsService {
//   async generateReport(customerId: string, reportType: ReportType, startTime: Date, endTime: Date) {
//     // Lấy danh sách các sensor liên quan (có thể lọc theo customer)   
//     // Logic tính toán thống kê cho từng loại sensor...
    
//     return { message: "Report generation logic to be implemented here" };
//   }

//   async getCustomerReports(customerId: string) {
//     return analyticsRepo.getReportsByCustomer(customerId);
//   }
// }

// export const analyticsService = new AnalyticsService();