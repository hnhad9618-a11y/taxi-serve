const express = require('express');
const app = express();
app.use(express.json());

// قاعدة بيانات وهمية للطلبات والسائقين
let tripsDatabase = [];
let driversDatabase = [
  { driverId: "DRV-1", isOnline: true, lat: 33.3100, lng: 44.3600 },
  { driverId: "DRV-2", isOnline: true, lat: 33.3200, lng: 44.3700 }
];

// نقطة استقبال طلب الرحلة مع ميزة عدد الركاب والسعر المحفز
app.post('/api/request-trip', (req, res) => {
    const { customerId, pickup, dropoff, passengerCount, totalFare } = req.body;

    const newTrip = {
        tripId: "TRIP-" + Date.now(),
        customerId,
        pickup,
        dropoff,
        passengerCount, 
        totalFare,       
        status: "requested", 
        driverId: null,
        createdAt: new Date()
    };

    tripsDatabase.push(newTrip);
    const availableDriver = driversDatabase.find(d => d.isOnline);

    if (availableDriver) {
        return res.status(200).json({
            success: true,
            message: "جاري البحث عن كابتن وإرسال الطلب",
            tripId: newTrip.tripId
        });
    } else {
        return res.status(404).json({
            success: false,
            message: "عذراً، لا توجد سيارات متاحة حالياً"
        });
    }
});

// نقطة موافقة السائق على الرحلة
app.post('/api/accept-trip', (req, res) => {
    const { tripId, driverId } = req.body;
    let trip = tripsDatabase.find(t => t.tripId === tripId);
    if (trip) {
        trip.driverId = driverId;
        trip.status = "accepted";
        return res.status(200).json({ success: true, message: "تم قبول الرحلة بنجاح", trip });
    }
    res.status(404).json({ success: false, message: "الرحلة غير موجودة" });
});

// تشغيل السيرفر على المنفذ المخصص سحابياً أو محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
