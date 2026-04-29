import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import { Role, DeviceType, DeviceStatus, DataType, Frequency, 
         RequestType, RequestStatus, ReportType
       } from '@prisma/client';
import bcrypt from 'bcrypt';

async function main() {
    console.log("Start database seeding...");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // ─── LOCATION ──────────────────────────────────────────────
    const location = await prisma.location.create({
        data: {
            locationName: "Living Room",
        },
    });
    console.log("Created Location: Living Room");

    // ─── USER ──────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            username: "admin_home",
            email: "admin123@gmail.com",
            password: hashedPassword,
            role: Role.ADMIN,
            firstName: "Nguyen",
            lastName: "A",
            admin: {
                create: {},
            },
        },
    });

    console.log("Admin created: admin_home");

    const customer = await prisma.user.create({
        data: {
            username: "customer_01",
            email: "customer@gmail.com",
            password: hashedPassword,
            role: Role.CUSTOMER,
            firstName: "Tran",
            lastName: "B",
            customer: {
                create: {
                    adminId: admin.userId,
                },
            },
        },
    });

    console.log("Customer created: customer_01")

    // ─── DEVICE ──────────────────────────────────────────────
    const sensorDevice = await prisma.device.create({
        data: {
            deviceName: "DHT11 Sensor",
            status: DeviceStatus.ONLINE,
            deviceType: DeviceType.SENSOR,
            locationId: location.locationId,
            serial: "SENSOR-0001",
            sensor: {
                create: {
                    unit: "Celcius",
                    threshold: 35,
                },
            },
        },
    });
    
    console.log("Sensor device created: DHT11");

    const actuatorDevice = await prisma.device.create({
        data: {
            deviceName: "Ceiling Light",
            status: DeviceStatus.OFFLINE,
            deviceType: DeviceType.ACTUATOR,
            locationId: location.locationId,
            serial: "ACT-0001",
            actuator: {
                create: {
                    customerId: customer.userId,
                },
            },
        },
    });

    console.log("Actuator device created: Ceiling Light");

    // ─── REQUEST ──────────────────────────────────────────────
    await prisma.request.create({
        data: {
            content: "Add new device request",
            requestType: RequestType.ADD,
            status: RequestStatus.PENDING,
            serial: "ACT-0001",
            deviceId: actuatorDevice.deviceId,
            customerId: customer.userId,
            adminId: admin.userId,
        },
    });

    console.log("Request created");

    // ─── DATA ──────────────────────────────────────────────
    await prisma.data.create({
        data: {
            timestamp: new Date(),
            sensorId: sensorDevice.deviceId,
            dataType: DataType.TEMPERATURE,
            value: 28.5,
        },
    });

    console.log("Sensor data inserted");

    // ─── REPORT ──────────────────────────────────────────────
    const report = await prisma.report.create({
        data: {
            reportType: ReportType.DAILY,
            customerId: customer.userId,
            startTime: new Date(),
            endTime: new Date(),
        },
    });

    await prisma.summaryData.create({
        data: {
            metricName: "AVG_TEMP",
            reportId: report.reportId,
            sensorId:sensorDevice.deviceId,
            value: 28.5,
        },
    });

    console.log("Report and summar data created");

    console.log("Seeding completed successfully!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })

    .catch(async (e) => {
        console.error("Seeding error:", e);
        await prisma.$disconnect();
        process.exit(1);
    })