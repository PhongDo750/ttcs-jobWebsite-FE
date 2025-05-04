document.addEventListener("DOMContentLoaded", async () => {
    if (!("serviceWorker" in navigator)) {
        console.error("❌ Trình duyệt không hỗ trợ Service Worker.");
        return;
    }

    let reg = await navigator.serviceWorker.ready; // Kiểm tra Service Worker đã sẵn sàng
    let subscription = await reg.pushManager.getSubscription(); // Kiểm tra subscriptions
    console.log("sub", subscription);

    const permission = Notification.permission;

    if (!subscription) {
        if (permission === "granted") {
            await registerServiceWorkerAndSubscribe();
            alert("Đăng ký thông báo thành công");
            return;
        }
    }

    if(permission === "denied" && localStorage.getItem("sub")) {
        await unsubscribeFromPushNotifications();
        localStorage.removeItem("sub");
        return;
    }

});

// ✅ Đăng ký Service Worker & Push Notification
async function registerServiceWorkerAndSubscribe() {
    try {
        let reg = await navigator.serviceWorker.register("/js/sw.js");
        console.log("✅ Service Worker đăng ký thành công:", reg);

        let readyReg = await navigator.serviceWorker.ready;
        console.log("✅ Service Worker đã sẵn sàng:", readyReg);

        let subscription = await readyReg.pushManager.getSubscription();
        if (!subscription) {
            subscription = await subscribeToPushNotifications(readyReg);
            if (subscription) {
                await sendSubscriptionToServer(subscription);
            }
        } else {
            console.log("📌 Subscription đã tồn tại:", subscription);
        }
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký Service Worker:", error);
    }
}

async function unsubscribeFromPushNotifications() {
    const accessToken = localStorage.getItem("token");

    try {
        // Gửi request hủy lên server (chỉ cần token)
        const response = await fetch("http://localhost:8086/api/v1/push-notification/unsubscribe", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) throw new Error("Server trả về lỗi.");
        console.log("✅ Đã thông báo server hủy thành công.");
        alert("Hủy thông báo thành công");
    } catch (error) {
        console.error("❌ Lỗi khi hủy đăng ký thông báo:", error);
        alert("Đã xảy ra lỗi khi hủy nhận thông báo.");
    }
}

// ✅ Đăng ký Push Notifications
async function subscribeToPushNotifications(reg) {
    const publicVapidKey = "BH-fRSeM2e64YC2XlKHhojUusW9j7DcGRcvJ_Fk3RUpiIUUbX5Kn9yc3Gyty3-ZsVhhTy3YhG-Q5_x0he4wrRX4";

    if (!reg.pushManager) {
        console.error("❌ Trình duyệt không hỗ trợ Push API.");
        return null;
    }

    try {
        console.log("📌 Đang đăng ký Push Subscription...");
        let subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        console.log("✅ Đăng ký Push thành công:", subscription);
        localStorage.setItem("sub", subscription);
        return subscription;
    } catch (error) {
        console.error("❌ Lỗi khi đăng ký Push:", error);
        return null;
    }
}

// ✅ Gửi subscription lên server
async function sendSubscriptionToServer(subscription) {
    const accessToken = localStorage.getItem("token");
    try {
        let response = await fetch("http://localhost:8086/api/v1/push-notification/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!response.ok) throw new Error("Lỗi khi gửi subscription lên server.");
        console.log("✅ Subscription đã được gửi lên server!");
    } catch (error) {
        console.error("❌ Lỗi khi gửi subscription:", error);
    }
}

async function removeSubscriptionFromServer() {
    const accessToken = localStorage.getItem("token");

    try {
        const res = await fetch(`http://localhost:8086/api/v1/push-notification/unsubscribe`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        if (!res.ok) throw new Error("❌ Lỗi khi xóa subscription khỏi server.");
        console.log("✅ Subscription đã được xóa khỏi server.");
    } catch (err) {
        console.error(err.message);
    }
}



// 🔧 Chuyển VAPID Key từ Base64 sang Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
