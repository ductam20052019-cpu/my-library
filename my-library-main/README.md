# PTIT Library

Frontend thuần HTML/CSS/JavaScript cho hệ thống thư viện nhóm CNPM.

## Folder Structure

```text
my-library-main/
├── public/
│   └── assets/
│       ├── fonts/
│       ├── icons/
│       └── images/
├── src/
│   ├── components/
│   ├── features/
│   ├── layouts/
│   ├── pages/
│   │   ├── admin/
│   │   └── auth/
│   ├── scripts/
│   ├── services/
│   ├── styles/
│   └── utils/
├── archive/
│   ├── backups/
│   └── firebase-hosting-default/
├── firebase.json
└── index.html
```

## Conventions

- `src/scripts`: code điều khiển UI và nghiệp vụ phía client.
- `src/services`: cấu hình/tích hợp dịch vụ ngoài, ví dụ Firebase.
- `src/styles`: CSS chính của giao diện.
- `src/pages`: các trang phụ hoặc file redirect.
- `src/components`, `src/layouts`, `src/features`, `src/utils`: để tách code khi project lớn hơn.
- `public/assets`: ảnh, icon, font và các file tĩnh dùng trực tiếp.

Mở `index.html` trực tiếp trong trình duyệt hoặc deploy bằng Firebase Hosting theo `firebase.json`.

## Firebase Security

Firestore Rules nằm trong `firestore.rules`. Tài khoản admin cần có document:

```text
roles/{firebaseAuthUid}
```

với dữ liệu:

```json
{ "role": "admin" }
```

Mỗi user mới sẽ có thêm index `usernames/{USERNAME}` và `authUsers/{authUid}` để đăng nhập/khôi phục phiên không phải dựa vào mật khẩu lưu trong Firestore.
