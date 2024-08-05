/*
 * @Author: Lin Ya
 * @Date: 2024-07-17 15:46:16
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-17 16:09:28
 * @Description: 发送桌面通知（标准web api）
 */
export function notice(msg: string) {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        var notification = new Notification(msg);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                var notification = new Notification(msg);
            }
        });
    }
}

export function noticeRequest() {
    if (!("Notification" in window)) {
        console.warn("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        return;
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                var notification = new Notification("允许通知啦！");
            }
        });
    }
}