-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('SENSOR', 'ACTUATOR');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('ONCE', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('TEMPERATURE', 'HUMIDITY', 'GAS');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('ADD', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "LOCATION" (
    "Location_ID" TEXT NOT NULL,
    "Location_name" TEXT,

    CONSTRAINT "LOCATION_pkey" PRIMARY KEY ("Location_ID")
);

-- CreateTable
CREATE TABLE "USER" (
    "User_ID" TEXT NOT NULL,
    "Username" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "F_name" TEXT,
    "L_name" TEXT,
    "Role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "CUSTOMER" (
    "User_ID" TEXT NOT NULL,
    "Customer_AdminID" TEXT,

    CONSTRAINT "CUSTOMER_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "ADMIN" (
    "User_ID" TEXT NOT NULL,

    CONSTRAINT "ADMIN_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "DEVICE" (
    "Device_ID" TEXT NOT NULL,
    "Serial" TEXT NOT NULL,
    "Device_name" TEXT,
    "Status" "DeviceStatus",
    "Device_type" "DeviceType",
    "Device_LocationID" TEXT,

    CONSTRAINT "DEVICE_pkey" PRIMARY KEY ("Device_ID")
);

-- CreateTable
CREATE TABLE "ACTUATOR" (
    "Device_ID" TEXT NOT NULL,
    "Actuator_CustomerID" TEXT,

    CONSTRAINT "ACTUATOR_pkey" PRIMARY KEY ("Device_ID")
);

-- CreateTable
CREATE TABLE "SENSOR" (
    "Device_ID" TEXT NOT NULL,
    "Unit" TEXT,
    "Threshold" DOUBLE PRECISION,

    CONSTRAINT "SENSOR_pkey" PRIMARY KEY ("Device_ID")
);

-- CreateTable
CREATE TABLE "DATA" (
    "Time_stamp" TIMESTAMP(3) NOT NULL,
    "Sensor_ID" TEXT NOT NULL,
    "Data_type" "DataType" NOT NULL,
    "Value" DOUBLE PRECISION,

    CONSTRAINT "DATA_pkey" PRIMARY KEY ("Time_stamp","Sensor_ID","Data_type")
);

-- CreateTable
CREATE TABLE "NOTIFICATION" (
    "Noti_ID" TEXT NOT NULL,
    "Title" TEXT,
    "Content" TEXT,
    "Is_read" BOOLEAN NOT NULL DEFAULT false,
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Noti_UserID" TEXT NOT NULL,
    "Noti_DeviceID" TEXT,

    CONSTRAINT "NOTIFICATION_pkey" PRIMARY KEY ("Noti_ID")
);

-- CreateTable
CREATE TABLE "REQUEST" (
    "Request_ID" TEXT NOT NULL,
    "Content" TEXT,
    "Request_type" "RequestType",
    "Status" "RequestStatus",
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Note" TEXT,
    "Serial" TEXT,
    "Request_DeviceID" TEXT,
    "Request_UserID" TEXT,
    "Request_AdminID" TEXT,

    CONSTRAINT "REQUEST_pkey" PRIMARY KEY ("Request_ID")
);

-- CreateTable
CREATE TABLE "SCHEDULE" (
    "Schedule_ID" TEXT NOT NULL,
    "Duration" INTEGER,
    "Action" TEXT,
    "Frequency" "Frequency",
    "Start_time" TIMESTAMP(3),
    "Sched_UserID" TEXT NOT NULL,
    "Sched_DeviceID" TEXT NOT NULL,

    CONSTRAINT "SCHEDULE_pkey" PRIMARY KEY ("Schedule_ID")
);

-- CreateTable
CREATE TABLE "REPORT" (
    "Report_ID" TEXT NOT NULL,
    "Report_type" "ReportType",
    "Created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Start_time" TIMESTAMP(3),
    "End_time" TIMESTAMP(3),
    "Report_UserID" TEXT NOT NULL,

    CONSTRAINT "REPORT_pkey" PRIMARY KEY ("Report_ID")
);

-- CreateTable
CREATE TABLE "SUMMARY_DATA" (
    "Metric_name" TEXT NOT NULL,
    "Report_ID" TEXT NOT NULL,
    "Sensor_ID" TEXT NOT NULL,
    "Value" DOUBLE PRECISION,

    CONSTRAINT "SUMMARY_DATA_pkey" PRIMARY KEY ("Metric_name","Report_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "USER_Username_key" ON "USER"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "USER_Email_key" ON "USER"("Email");

-- CreateIndex
CREATE INDEX "CUSTOMER_Customer_AdminID_idx" ON "CUSTOMER"("Customer_AdminID");

-- CreateIndex
CREATE UNIQUE INDEX "DEVICE_Serial_key" ON "DEVICE"("Serial");

-- CreateIndex
CREATE INDEX "DEVICE_Device_LocationID_idx" ON "DEVICE"("Device_LocationID");

-- CreateIndex
CREATE INDEX "DEVICE_Serial_idx" ON "DEVICE"("Serial");

-- CreateIndex
CREATE INDEX "ACTUATOR_Actuator_CustomerID_idx" ON "ACTUATOR"("Actuator_CustomerID");

-- CreateIndex
CREATE INDEX "DATA_Sensor_ID_Time_stamp_idx" ON "DATA"("Sensor_ID", "Time_stamp");

-- CreateIndex
CREATE INDEX "NOTIFICATION_Noti_UserID_idx" ON "NOTIFICATION"("Noti_UserID");

-- CreateIndex
CREATE INDEX "NOTIFICATION_Noti_DeviceID_idx" ON "NOTIFICATION"("Noti_DeviceID");

-- CreateIndex
CREATE INDEX "NOTIFICATION_Noti_UserID_Is_read_idx" ON "NOTIFICATION"("Noti_UserID", "Is_read");

-- CreateIndex
CREATE INDEX "REQUEST_Request_UserID_idx" ON "REQUEST"("Request_UserID");

-- CreateIndex
CREATE INDEX "REQUEST_Request_AdminID_idx" ON "REQUEST"("Request_AdminID");

-- CreateIndex
CREATE INDEX "REQUEST_Request_DeviceID_idx" ON "REQUEST"("Request_DeviceID");

-- CreateIndex
CREATE INDEX "REQUEST_Status_Created_at_idx" ON "REQUEST"("Status", "Created_at");

-- CreateIndex
CREATE INDEX "SCHEDULE_Sched_UserID_idx" ON "SCHEDULE"("Sched_UserID");

-- CreateIndex
CREATE INDEX "SCHEDULE_Sched_DeviceID_idx" ON "SCHEDULE"("Sched_DeviceID");

-- CreateIndex
CREATE INDEX "REPORT_Report_UserID_idx" ON "REPORT"("Report_UserID");

-- CreateIndex
CREATE INDEX "SUMMARY_DATA_Sensor_ID_idx" ON "SUMMARY_DATA"("Sensor_ID");

-- CreateIndex
CREATE INDEX "SUMMARY_DATA_Report_ID_idx" ON "SUMMARY_DATA"("Report_ID");

-- AddForeignKey
ALTER TABLE "CUSTOMER" ADD CONSTRAINT "CUSTOMER_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "USER"("User_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CUSTOMER" ADD CONSTRAINT "CUSTOMER_Customer_AdminID_fkey" FOREIGN KEY ("Customer_AdminID") REFERENCES "ADMIN"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ADMIN" ADD CONSTRAINT "ADMIN_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "USER"("User_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DEVICE" ADD CONSTRAINT "DEVICE_Device_LocationID_fkey" FOREIGN KEY ("Device_LocationID") REFERENCES "LOCATION"("Location_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACTUATOR" ADD CONSTRAINT "ACTUATOR_Device_ID_fkey" FOREIGN KEY ("Device_ID") REFERENCES "DEVICE"("Device_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ACTUATOR" ADD CONSTRAINT "ACTUATOR_Actuator_CustomerID_fkey" FOREIGN KEY ("Actuator_CustomerID") REFERENCES "CUSTOMER"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SENSOR" ADD CONSTRAINT "SENSOR_Device_ID_fkey" FOREIGN KEY ("Device_ID") REFERENCES "DEVICE"("Device_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DATA" ADD CONSTRAINT "DATA_Sensor_ID_fkey" FOREIGN KEY ("Sensor_ID") REFERENCES "SENSOR"("Device_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTIFICATION" ADD CONSTRAINT "NOTIFICATION_Noti_UserID_fkey" FOREIGN KEY ("Noti_UserID") REFERENCES "USER"("User_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTIFICATION" ADD CONSTRAINT "NOTIFICATION_Noti_DeviceID_fkey" FOREIGN KEY ("Noti_DeviceID") REFERENCES "DEVICE"("Device_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REQUEST" ADD CONSTRAINT "REQUEST_Request_DeviceID_fkey" FOREIGN KEY ("Request_DeviceID") REFERENCES "DEVICE"("Device_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REQUEST" ADD CONSTRAINT "REQUEST_Request_UserID_fkey" FOREIGN KEY ("Request_UserID") REFERENCES "CUSTOMER"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REQUEST" ADD CONSTRAINT "REQUEST_Request_AdminID_fkey" FOREIGN KEY ("Request_AdminID") REFERENCES "ADMIN"("User_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SCHEDULE" ADD CONSTRAINT "SCHEDULE_Sched_UserID_fkey" FOREIGN KEY ("Sched_UserID") REFERENCES "CUSTOMER"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SCHEDULE" ADD CONSTRAINT "SCHEDULE_Sched_DeviceID_fkey" FOREIGN KEY ("Sched_DeviceID") REFERENCES "ACTUATOR"("Device_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REPORT" ADD CONSTRAINT "REPORT_Report_UserID_fkey" FOREIGN KEY ("Report_UserID") REFERENCES "CUSTOMER"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUMMARY_DATA" ADD CONSTRAINT "SUMMARY_DATA_Report_ID_fkey" FOREIGN KEY ("Report_ID") REFERENCES "REPORT"("Report_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SUMMARY_DATA" ADD CONSTRAINT "SUMMARY_DATA_Sensor_ID_fkey" FOREIGN KEY ("Sensor_ID") REFERENCES "SENSOR"("Device_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
