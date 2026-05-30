import 'dotenv/config';
import { prisma } from '../src/config/prisma';
import {
    Role,
    DeviceType,
    DeviceStatus,
    DataType,
    RequestType,
    RequestStatus,
    ReportType,
} from '@prisma/client';
import bcrypt from 'bcrypt';

async function main() {
    console.log('Start database seeding...');

    // ─── DELETE OLD DATA ─────────────────────────────
    await prisma.summaryData.deleteMany();
    await prisma.report.deleteMany();
    await prisma.data.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.request.deleteMany();

    await prisma.sensor.deleteMany();
    await prisma.actuator.deleteMany();

    await prisma.device.deleteMany();

    await prisma.customer.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.user.deleteMany();

    await prisma.location.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ─── LOCATION ────────────────────────────────────
    const livingRoom = await prisma.location.create({
        data: {
            locationName: 'Living Room',
        },
    });

    const kitchen = await prisma.location.create({
        data: {
            locationName: 'Kitchen',
        },
    });

    const bedroom = await prisma.location.create({
        data: {
            locationName: 'Bedroom',
        },
    });

    console.log('Locations created');

    // ─── ADMIN USER ─────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            username: 'admin_home',
            email: 'admin123@gmail.com',
            password: hashedPassword,
            role: Role.ADMIN,
            firstName: 'Nguyen',
            lastName: 'Van A',
            admin: {
                create: {},
            },
        },
        include: {
            admin: true,
        },
    });

    // ─── CUSTOMER USER ──────────────────────────────
    const customer = await prisma.user.create({
        data: {
            username: 'customer_01',
            email: 'customer@gmail.com',
            password: hashedPassword,
            role: Role.CUSTOMER,
            firstName: 'Tran',
            lastName: 'Van B',
            customer: {
                create: {
                    adminId: admin.userId,
                },
            },
        },
        include: {
            customer: true,
        },
    });

    console.log('Admin and Customer created');

    // ─── SENSOR DEVICE ──────────────────────────────
    const gasSensor = await prisma.device.create({
        data: {
            deviceName: 'MQ2 Gas Sensor',
            status: DeviceStatus.ONLINE,
            deviceType: DeviceType.SENSOR,
            serial: 'SN-GAS-001',
            tbDeviceId: '1fe1c960-9824-11ef-93e1-d30900259922',
            location: {
                connect: {
                    locationId: livingRoom.locationId,
                },
            },
            sensor: {
                create: {
                    unit: 'ppm',
                    threshold: 400,
                },
            },
        },
        include: {
            sensor: true,
        },
    });

    // ─── ACTUATOR DEVICE ────────────────────────────
    const ceilingLight = await prisma.device.create({
        data: {
            deviceName: 'Ceiling Light',
            status: DeviceStatus.ONLINE,
            deviceType: DeviceType.ACTUATOR,
            serial: 'SN-LIGHT-001',
            tbDeviceId: '2af2d170-9824-11ef-93e1-d30900258833',
            location: {
                connect: {
                    locationId: kitchen.locationId,
                },
            },
            actuator: {
                create: {
                    customerId: customer.userId,
                },
            },
        },
        include: {
            actuator: true,
        },
    });

    const kitchenFan = await prisma.device.create({
        data: {
            deviceName: 'Kitchen Fan',
            status: DeviceStatus.OFFLINE,
            deviceType: DeviceType.ACTUATOR,
            serial: 'SN-FAN-001',
            tbDeviceId: '3bc3e280-9824-11ef-93e1-d30900257744',
            location: {
                connect: {
                    locationId: kitchen.locationId,
                },
            },
            actuator: {
                create: {
                    customerId: customer.userId,
                },
            },
        },
    });

    console.log('Devices created');

    // ─── SENSOR DATA ────────────────────────────────
    await prisma.data.createMany({
        data: [
            {
                timestamp: new Date(Date.now() - 3600000),
                sensorId: gasSensor.deviceId,
                dataType: DataType.GAS,
                value: 120.5,
            },
            {
                timestamp: new Date(),
                sensorId: gasSensor.deviceId,
                dataType: DataType.GAS,
                value: 125.0,
            },
        ],
    });

    console.log('Sensor data inserted');

    // ─── REPORT ─────────────────────────────────────
    const report = await prisma.report.create({
        data: {
            reportType: ReportType.DAILY,
            customerId: customer.userId,
            startTime: new Date(new Date().setHours(0, 0, 0, 0)),
            endTime: new Date(),
        },
    });

    // ─── SUMMARY DATA ───────────────────────────────
    await prisma.summaryData.create({
        data: {
            metricName: 'MAX_GAS_LEVEL',
            reportId: report.reportId,
            sensorId: gasSensor.deviceId,
            value: 125.0,
        },
    });

    console.log('Report and summary data created');
    console.log('Seeding completed successfully!');
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