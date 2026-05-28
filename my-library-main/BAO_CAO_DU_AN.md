# BÁO CÁO DỰ ÁN: HỆ THỐNG THƯ VIỆN TRỰC TUYẾN PTIT HCM

## MỤC LỤC ĐỀ XUẤT

**DANH MỤC HÌNH ẢNH**

**DANH MỤC BẢNG**

**CHƯƠNG I - GIỚI THIỆU ĐỀ TÀI**

1.1. Giới thiệu chung

1.2. Lý do chọn đề tài

1.3. Mục tiêu của đề tài

1.4. Phạm vi thực hiện

1.5. Đối tượng sử dụng hệ thống

1.6. Bố cục báo cáo

**CHƯƠNG II - TỔNG QUAN VỀ HỆ THỐNG THƯ VIỆN TRỰC TUYẾN VÀ CÔNG NGHỆ SỬ DỤNG**

2.1. Tổng quan về thư viện trực tuyến

2.2. Tổng quan về ứng dụng web quản lý thư viện

2.3. Tổng quan về Firebase

2.4. Các công nghệ sử dụng trong dự án

2.5. Các nghiệp vụ chính của hệ thống thư viện

**CHƯƠNG III - THIẾT KẾ HỆ THỐNG THƯ VIỆN TRỰC TUYẾN**

3.1. Yêu cầu hệ thống

3.2. Kiến trúc tổng thể

3.3. Thiết kế chức năng

3.4. Thiết kế cơ sở dữ liệu

3.5. Thiết kế giao diện người dùng

3.6. Thiết kế phân quyền và bảo mật

**CHƯƠNG IV - THI CÔNG VÀ KIỂM THỬ**

4.1. Môi trường phát triển

4.2. Xây dựng giao diện frontend

4.3. Tích hợp Firebase

4.4. Lập trình các chức năng chính

4.5. Triển khai hệ thống

4.6. Kiểm thử chức năng

**CHƯƠNG V - ĐÁNH GIÁ VÀ SO SÁNH HIỆU NĂNG HỆ THỐNG**

5.1. Đánh giá chức năng

5.2. Đánh giá giao diện và trải nghiệm người dùng

5.3. Đánh giá hiệu năng tải dữ liệu

5.4. Đánh giá bảo mật và phân quyền

5.5. So sánh với phương pháp quản lý thủ công

5.6. Hạn chế của hệ thống

**CHƯƠNG VI - KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN ĐỀ TÀI**

6.1. Kết quả đạt được

6.2. Những khó khăn trong quá trình thực hiện

6.3. Hướng phát triển trong tương lai

**DANH MỤC TỪ VIẾT TẮT**

**TÀI LIỆU THAM KHẢO**

---

## DANH MỤC HÌNH ẢNH

Hình 1.1. Giao diện trang chủ hệ thống thư viện trực tuyến

Hình 2.1. Mô hình hoạt động của hệ thống thư viện trực tuyến

Hình 3.1. Kiến trúc tổng thể của hệ thống

Hình 3.2. Luồng đăng nhập và phân quyền người dùng

Hình 3.3. Luồng đăng ký mượn sách của độc giả

Hình 3.4. Luồng duyệt mượn và trả sách của quản trị viên

Hình 4.1. Giao diện quản lý đầu sách

Hình 4.2. Giao diện quản lý độc giả

Hình 4.3. Giao diện thống kê tổng quan hệ thống

Hình 5.1. Kết quả kiểm thử các chức năng chính

## DANH MỤC BẢNG

Bảng 1.1. Đối tượng sử dụng và nhu cầu chính

Bảng 2.1. Các công nghệ sử dụng trong dự án

Bảng 3.1. Yêu cầu chức năng của hệ thống

Bảng 3.2. Yêu cầu phi chức năng của hệ thống

Bảng 3.3. Cấu trúc dữ liệu chính trên Firestore

Bảng 4.1. Danh sách kịch bản kiểm thử chức năng

Bảng 5.1. So sánh quản lý thủ công và quản lý bằng hệ thống

---

# CHƯƠNG I - GIỚI THIỆU ĐỀ TÀI

## 1.1. Giới thiệu chung

Trong môi trường đại học, thư viện là nơi cung cấp giáo trình, tài liệu tham khảo, sách chuyên ngành và các nguồn học liệu phục vụ học tập, nghiên cứu. Khi số lượng đầu sách và số lượng người mượn tăng lên, việc quản lý bằng sổ sách hoặc bảng tính thủ công dễ phát sinh sai sót, khó cập nhật tồn kho và khó theo dõi lịch sử mượn - trả.

Đề tài **Hệ thống thư viện trực tuyến PTIT HCM** được xây dựng nhằm hỗ trợ số hóa các nghiệp vụ cơ bản của thư viện. Hệ thống cho phép người dùng tra cứu sách, đăng ký mượn, theo dõi trạng thái mượn - trả, đồng thời hỗ trợ quản trị viên quản lý đầu sách, độc giả, duyệt yêu cầu mượn, xác nhận trả sách và thống kê tình trạng kho.

Dự án được phát triển dưới dạng ứng dụng web sử dụng HTML, CSS, JavaScript và Firebase. Với hướng triển khai này, hệ thống có thể chạy trực tiếp trên trình duyệt, dữ liệu được lưu trữ tập trung trên Cloud Firestore và quyền truy cập được kiểm soát bằng Firebase Authentication kết hợp Firestore Security Rules.

## 1.2. Lý do chọn đề tài

Quản lý thư viện là bài toán quen thuộc nhưng có nhiều nghiệp vụ phù hợp để áp dụng kiến thức Công nghệ phần mềm. Một hệ thống thư viện trực tuyến giúp giảm thao tác thủ công, tăng tính minh bạch trong quá trình mượn - trả và giúp quản trị viên dễ theo dõi tình trạng hoạt động của thư viện.

Những vấn đề thường gặp trong quản lý thủ công gồm:

- Người đọc không biết chính xác sách còn hay hết.
- Nhân viên thư viện khó kiểm tra nhanh lịch sử mượn - trả.
- Việc duyệt mượn, xác nhận trả và theo dõi quá hạn dễ bị nhầm lẫn.
- Thống kê số lượng sách, tồn kho thấp hoặc sách đang cho mượn mất nhiều thời gian.
- Dữ liệu người dùng và phiếu mượn khó đồng bộ nếu lưu rời rạc.

Vì vậy, nhóm lựa chọn đề tài này để xây dựng một sản phẩm có tính thực tiễn, dễ triển khai, phù hợp quy mô môn học và có thể mở rộng trong tương lai.

## 1.3. Mục tiêu của đề tài

Mục tiêu tổng quát của đề tài là xây dựng một hệ thống thư viện trực tuyến hỗ trợ người dùng tra cứu, mượn sách và hỗ trợ quản trị viên quản lý hoạt động thư viện.

Các mục tiêu cụ thể:

- Xây dựng giao diện web thân thiện, dễ sử dụng.
- Cho phép khách truy cập tìm kiếm sách theo tên sách hoặc tác giả.
- Cho phép độc giả đăng nhập, đăng ký mượn sách và xem lịch sử mượn - trả.
- Cho phép quản trị viên duyệt yêu cầu mượn, xác nhận trả sách và quản lý sách đang mượn.
- Hỗ trợ quản lý đầu sách: thêm, sửa, xóa, lọc, sắp xếp, import và export Excel/CSV.
- Hỗ trợ quản lý độc giả: tạo tài khoản, khóa/mở tài khoản và xem lịch sử mượn.
- Xây dựng dashboard thống kê tổng đầu sách, tổng tồn kho, sách đang cho mượn và sách sắp hết.
- Áp dụng phân quyền dữ liệu bằng Firebase Authentication và Firestore Rules.

## 1.4. Phạm vi thực hiện

Đề tài tập trung xây dựng một website quản lý thư viện ở quy mô nhỏ đến trung bình. Hệ thống sử dụng frontend thuần và Firebase làm nền tảng backend-as-a-service.

Phạm vi đã thực hiện:

- Trang chủ tra cứu sách.
- Trang giới thiệu, tin tức, trợ giúp và liên hệ.
- Đăng nhập, quên mật khẩu và đổi mật khẩu.
- Khu vực cá nhân của độc giả.
- Khu vực quản trị dành cho admin.
- Quản lý sách, quản lý độc giả, duyệt mượn, trả sách và thống kê.
- Đặt trước sách khi hết tồn kho, quản lý hàng chờ đặt trước.
- Sách yêu thích, thông báo trong hệ thống và nhật ký thao tác quản trị.
- Hiển thị mã QR/mã vạch cho đầu sách và dashboard thống kê bằng biểu đồ.
- Bổ sung vai trò thủ thư để phân quyền chi tiết hơn.
- Cấu hình Firebase Hosting, Firebase Authentication và Cloud Firestore.

Phạm vi chưa thực hiện:

- Thanh toán phí phạt trực tuyến.
- Gửi email tự động khi sách sắp đến hạn trả.
- Báo cáo thống kê học kỳ/khoa chuyên sâu dạng xuất file.
- Backend riêng để xử lý các nghiệp vụ phức tạp.

## 1.5. Đối tượng sử dụng hệ thống

| Đối tượng | Nhu cầu chính |
| --- | --- |
| Khách truy cập | Xem thông tin thư viện, tra cứu tài liệu, đọc hướng dẫn và gửi phản hồi liên hệ. |
| Độc giả | Đăng nhập, tìm sách, đăng ký mượn, xem trạng thái duyệt, xem sách đang mượn và lịch sử trả sách. |
| Quản trị viên | Quản lý sách, quản lý độc giả, duyệt yêu cầu mượn, xác nhận trả sách, theo dõi quá hạn và xem thống kê. |

## 1.6. Bố cục báo cáo

Báo cáo được triển khai theo 6 chương:

- **Chương I - Giới thiệu đề tài**: Trình bày sơ lược về đề tài, lý do chọn đề tài, mục tiêu và phạm vi thực hiện.
- **Chương II - Tổng quan về hệ thống thư viện trực tuyến và công nghệ sử dụng**: Cung cấp cơ sở lý thuyết về thư viện trực tuyến, ứng dụng web quản lý thư viện và Firebase.
- **Chương III - Thiết kế hệ thống thư viện trực tuyến**: Trình bày yêu cầu, kiến trúc, chức năng, dữ liệu, giao diện và phân quyền.
- **Chương IV - Thi công và kiểm thử**: Trình bày quá trình xây dựng giao diện, lập trình chức năng, tích hợp Firebase, triển khai và kiểm thử.
- **Chương V - Đánh giá và so sánh hiệu năng hệ thống**: Phân tích mức độ đáp ứng chức năng, trải nghiệm, hiệu năng, bảo mật và so sánh với phương pháp thủ công.
- **Chương VI - Kết luận và hướng phát triển đề tài**: Tóm tắt kết quả đạt được, khó khăn và hướng phát triển trong tương lai.

---

# CHƯƠNG II - TỔNG QUAN VỀ HỆ THỐNG THƯ VIỆN TRỰC TUYẾN VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. Tổng quan về thư viện trực tuyến

Thư viện trực tuyến là hệ thống cho phép người dùng truy cập, tra cứu và quản lý tài liệu thông qua môi trường mạng. So với thư viện truyền thống, thư viện trực tuyến giúp người dùng tìm kiếm tài liệu nhanh hơn, giảm phụ thuộc vào không gian vật lý và hỗ trợ quản trị viên quản lý dữ liệu tập trung.

Trong phạm vi đề tài, thư viện trực tuyến không chỉ là nơi hiển thị danh sách sách mà còn hỗ trợ nghiệp vụ mượn - trả. Người dùng có thể đăng ký mượn sách trên website, sau đó quản trị viên duyệt yêu cầu và cập nhật trạng thái phiếu mượn.

Các đặc điểm chính của thư viện trực tuyến:

- Dữ liệu sách được lưu trữ tập trung.
- Người dùng có thể tra cứu mọi lúc thông qua trình duyệt.
- Quá trình mượn - trả được ghi nhận bằng phiếu mượn điện tử.
- Quản trị viên dễ thống kê sách đang mượn, sách sắp hết và người dùng quá hạn.
- Hệ thống có thể phân quyền theo vai trò người dùng.

## 2.2. Tổng quan về ứng dụng web quản lý thư viện

Ứng dụng web quản lý thư viện là phần mềm chạy trên trình duyệt, giúp người dùng thao tác với dữ liệu thư viện thông qua giao diện trực quan. Một hệ thống cơ bản thường gồm các nhóm chức năng:

- Quản lý tài liệu: thêm, sửa, xóa, tìm kiếm và phân loại sách.
- Quản lý người dùng: tạo tài khoản, phân quyền, khóa hoặc mở tài khoản.
- Quản lý mượn - trả: tạo phiếu mượn, duyệt mượn, xác nhận trả và theo dõi quá hạn.
- Thống kê: tổng số sách, tồn kho, sách đang cho mượn và sách sắp hết.
- Hỗ trợ người dùng: hướng dẫn, liên hệ và phản hồi.

Trong dự án này, ứng dụng được xây dựng bằng HTML/CSS/JavaScript thuần. Cách tiếp cận này giúp cấu trúc dự án đơn giản, dễ triển khai và phù hợp với phạm vi môn học.

## 2.3. Tổng quan về Firebase

Firebase là nền tảng backend-as-a-service do Google cung cấp, hỗ trợ phát triển ứng dụng web và di động. Firebase giúp lập trình viên sử dụng các dịch vụ backend phổ biến mà không cần tự xây dựng máy chủ riêng.

Trong dự án, Firebase được sử dụng cho ba mục đích chính:

- **Firebase Authentication**: quản lý đăng nhập, khôi phục mật khẩu, đổi mật khẩu và phiên người dùng.
- **Cloud Firestore**: lưu trữ dữ liệu sách, người dùng, vai trò, username index và phiếu mượn.
- **Firebase Hosting**: triển khai website tĩnh.

Việc sử dụng Firebase giúp hệ thống giảm độ phức tạp ở phần backend, đồng thời vẫn có khả năng đồng bộ dữ liệu và phân quyền bảo mật thông qua Firestore Security Rules.

## 2.4. Các công nghệ sử dụng trong dự án

| Công nghệ | Vai trò |
| --- | --- |
| HTML5 | Xây dựng cấu trúc trang, form, bảng dữ liệu và modal. |
| CSS3 | Thiết kế giao diện, bố cục, responsive và trạng thái hiển thị. |
| JavaScript ES Module | Xử lý nghiệp vụ phía client, render dữ liệu và gọi Firebase SDK. |
| Firebase Authentication | Xác thực người dùng, đổi mật khẩu và khôi phục mật khẩu. |
| Cloud Firestore | Lưu dữ liệu sách, người dùng, phiếu mượn và vai trò. |
| Firebase Hosting | Triển khai website. |
| SheetJS/XLSX | Import/export danh sách sách bằng Excel hoặc CSV. |
| Google Books API | Hỗ trợ lấy thông tin sách từ nguồn bên ngoài khi thêm sách. |
| IT Book Store API | Hỗ trợ lấy danh sách sách công nghệ thông tin. |

## 2.5. Các nghiệp vụ chính của hệ thống thư viện

Các nghiệp vụ chính được hệ thống hỗ trợ gồm:

- **Tra cứu sách**: người dùng tìm sách theo tên hoặc tác giả.
- **Đăng ký mượn sách**: độc giả gửi yêu cầu mượn khi sách còn tồn kho.
- **Duyệt yêu cầu mượn**: quản trị viên duyệt hoặc từ chối yêu cầu.
- **Quản lý sách đang mượn**: theo dõi hạn trả, gia hạn và quá hạn.
- **Trả sách**: quản trị viên xác nhận trả và cập nhật lại tồn kho.
- **Tính phí phạt**: hệ thống tính phí dựa trên số ngày quá hạn và mức phạt/ngày.
- **Quản lý đầu sách**: thêm, sửa, xóa, lọc, sắp xếp, import và export sách.
- **Quản lý độc giả**: tạo tài khoản, khóa/mở tài khoản và xem lịch sử mượn.
- **Thống kê**: hiển thị tổng đầu sách, tổng tồn kho, sách đang cho mượn và sách sắp hết.

---

# CHƯƠNG III - THIẾT KẾ HỆ THỐNG THƯ VIỆN TRỰC TUYẾN

## 3.1. Yêu cầu hệ thống

### 3.1.1. Yêu cầu chức năng

| Mã | Yêu cầu chức năng |
| --- | --- |
| F01 | Hệ thống cho phép tìm kiếm sách theo tên sách hoặc tác giả. |
| F02 | Hệ thống hiển thị danh sách sách kèm tồn kho và nút đăng ký mượn. |
| F03 | Hệ thống cho phép người dùng đăng nhập, quên mật khẩu và đổi mật khẩu. |
| F04 | Độc giả có thể đăng ký mượn sách khi tài khoản hợp lệ và sách còn tồn kho. |
| F05 | Độc giả có thể xem sách đang mượn, yêu cầu chờ duyệt và lịch sử trả sách. |
| F06 | Quản trị viên có thể duyệt hoặc từ chối yêu cầu mượn. |
| F07 | Quản trị viên có thể xác nhận trả sách, gia hạn, lọc quá hạn và tính phí phạt. |
| F08 | Quản trị viên có thể thêm, sửa, xóa, lọc, sắp xếp, import và export sách. |
| F09 | Quản trị viên có thể tạo tài khoản, khóa/mở tài khoản và xem lịch sử mượn của độc giả. |
| F10 | Hệ thống cung cấp dashboard thống kê tổng quan. |

### 3.1.2. Yêu cầu phi chức năng

| Mã | Yêu cầu phi chức năng |
| --- | --- |
| NF01 | Giao diện dễ sử dụng, phù hợp cả desktop và mobile. |
| NF02 | Dữ liệu cần được lưu tập trung và đồng bộ khi có thay đổi. |
| NF03 | Chức năng quản trị chỉ hiển thị và hoạt động với tài khoản admin. |
| NF04 | Người dùng thường không được chỉnh sửa dữ liệu sách hoặc phiếu mượn của người khác. |
| NF05 | Hệ thống cần phản hồi rõ ràng khi thao tác thành công hoặc thất bại. |
| NF06 | Website có thể triển khai bằng Firebase Hosting. |

## 3.2. Kiến trúc tổng thể

Hệ thống được thiết kế theo mô hình web frontend kết hợp Firebase:

- **Frontend**: gồm `index.html`, `src/styles/main.css`, `src/scripts/ui.js`, `src/scripts/actions.js` và `src/scripts/main.js`.
- **Dịch vụ Firebase**: được cấu hình trong `src/services/firebase.js`.
- **Cơ sở dữ liệu**: Cloud Firestore lưu các collection như `books`, `loans`, `users`, `roles`, `usernames`, `authUsers`.
- **Phân quyền**: Firestore Security Rules trong file `firestore.rules`.
- **Triển khai**: Firebase Hosting cấu hình trong `firebase.json`.

Luồng hoạt động tổng quát:

1. Người dùng truy cập website.
2. File `main.js` khởi tạo Firebase, UI và logic nghiệp vụ.
3. Hệ thống tải dữ liệu sách và phiếu mượn từ Firestore.
4. Người dùng thao tác trên giao diện.
5. JavaScript gửi yêu cầu đọc/ghi dữ liệu đến Firestore.
6. Firestore Rules kiểm tra quyền trước khi cho phép thao tác.
7. Giao diện cập nhật lại dữ liệu và hiển thị thông báo cho người dùng.

## 3.3. Thiết kế chức năng

### 3.3.1. Nhóm chức năng khách truy cập

Khách truy cập có thể:

- Xem trang chủ.
- Tìm kiếm sách.
- Xem thông tin giới thiệu, tin tức, trợ giúp và liên hệ.
- Xem nội quy thư viện và hướng dẫn mượn.

Khách chưa đăng nhập không được đăng ký mượn sách.

### 3.3.2. Nhóm chức năng độc giả

Độc giả sau khi đăng nhập có thể:

- Đăng ký mượn sách.
- Theo dõi sách đang mượn hoặc đang chờ duyệt.
- Xem lịch sử trả sách.
- Gửi yêu cầu trả sách theo quy trình hệ thống.
- Đổi mật khẩu.
- Khôi phục mật khẩu qua email.

### 3.3.3. Nhóm chức năng quản trị viên

Quản trị viên có thể:

- Duyệt yêu cầu mượn.
- Từ chối yêu cầu mượn.
- Quản lý sách đang cho mượn.
- Gia hạn ngày trả.
- Xác nhận trả sách trực tiếp.
- Bật/tắt tính phí phạt và cấu hình mức phạt/ngày.
- Quản lý danh sách đầu sách.
- Import/export Excel hoặc CSV.
- Quản lý danh sách độc giả.
- Khóa hoặc mở khóa tài khoản.
- Xem lịch sử mượn của từng độc giả.
- Xem dashboard thống kê.

## 3.4. Thiết kế cơ sở dữ liệu

Hệ thống sử dụng Cloud Firestore với các collection chính:

| Collection | Chức năng |
| --- | --- |
| `books` | Lưu thông tin đầu sách. |
| `loans` | Lưu phiếu mượn và lịch sử xử lý mượn - trả. |
| `users` | Lưu hồ sơ người dùng. |
| `roles` | Lưu quyền admin theo Firebase Auth UID. |
| `usernames` | Ánh xạ username với thông tin tài khoản. |
| `authUsers` | Ánh xạ Firebase Auth UID với userId trong hệ thống. |

Một số trường dữ liệu tiêu biểu:

| Đối tượng | Trường dữ liệu |
| --- | --- |
| Sách | `title`, `author`, `stock`, `category`, `tag`, `publisher`, `year`, `img`, `desc`, `createdAt`, `addedBy`. |
| Người dùng | `username`, `name`, `email`, `className`, `dept`, `role`, `authUid`, `locked`. |
| Phiếu mượn | `username`, `bookId`, `bookTitle`, `date`, `borrowDate`, `dueDate`, `status`, `renewalCount`, `overdueDays`, `fineAmount`. |

## 3.5. Thiết kế giao diện người dùng

Giao diện hệ thống được chia thành các khu vực chính:

- **Thanh điều hướng**: truy cập trang chủ, giới thiệu, tin tức, trợ giúp, liên hệ và đăng nhập.
- **Sidebar**: hiển thị danh mục chung, khu vực cá nhân hoặc khu vực quản trị tùy theo vai trò.
- **Trang chủ**: ô tìm kiếm, bộ lọc và danh sách sách dạng thẻ.
- **Khu vực cá nhân**: bảng sách đang mượn/chờ duyệt và lịch sử trả sách.
- **Khu vực admin**: các bảng quản lý yêu cầu mượn, sách đang mượn, đầu sách, độc giả và dashboard.
- **Modal**: đăng nhập, quên mật khẩu, nội quy, hướng dẫn mượn, thêm/sửa sách và lịch sử mượn của độc giả.

Giao diện có hỗ trợ menu mobile, phân trang danh sách sách và thông báo toast khi thao tác.

## 3.6. Thiết kế phân quyền và bảo mật

Hệ thống phân quyền theo ba nhóm:

- **Khách**: chỉ xem thông tin công khai và tra cứu sách.
- **Độc giả**: được mượn sách và xem dữ liệu của chính mình.
- **Admin**: được quản lý toàn bộ sách, người dùng và phiếu mượn.

Firestore Rules được thiết kế theo nguyên tắc:

- Collection `books` cho phép mọi người đọc, chỉ admin được ghi.
- Collection `loans` cho phép admin đọc toàn bộ, người dùng chỉ đọc phiếu mượn của chính mình.
- Collection `users` cho phép admin quản lý, người dùng chỉ truy cập hồ sơ của chính mình.
- Collection `roles` dùng để xác định quyền admin.
- Các document không khai báo quyền sẽ bị từ chối theo mặc định.

---

# CHƯƠNG IV - THI CÔNG VÀ KIỂM THỬ

## 4.1. Môi trường phát triển

Dự án được phát triển trong môi trường web frontend thuần:

- Ngôn ngữ: HTML, CSS, JavaScript.
- Cơ sở dữ liệu: Cloud Firestore.
- Xác thực: Firebase Authentication.
- Hosting: Firebase Hosting.
- Thư viện hỗ trợ: SheetJS/XLSX.
- Công cụ quản lý mã nguồn: Git.

Cấu trúc thư mục chính:

```text
my-library-main/
├── index.html
├── firebase.json
├── firestore.rules
├── src/
│   ├── scripts/
│   │   ├── main.js
│   │   ├── ui.js
│   │   └── actions.js
│   ├── services/
│   │   └── firebase.js
│   └── styles/
│       └── main.css
├── public/
│   └── assets/
└── tools/
    └── seed-firestore.mjs
```

## 4.2. Xây dựng giao diện frontend

Giao diện chính được xây dựng trong `index.html`, bao gồm:

- Thanh menu trên cùng.
- Sidebar danh mục.
- Trang tìm kiếm sách.
- Các trang thông tin: giới thiệu, tin tức, trợ giúp, liên hệ.
- Khu vực độc giả.
- Khu vực quản trị.
- Các modal đăng nhập, quên mật khẩu, thêm/sửa sách và xem lịch sử.

File `main.css` đảm nhiệm định dạng bố cục, màu sắc, bảng dữ liệu, thẻ sách, modal, toast, responsive mobile và các thành phần quản trị.

## 4.3. Tích hợp Firebase

Firebase được tích hợp trong file `src/services/firebase.js`. File này thực hiện:

- Import Firebase SDK.
- Khởi tạo Firebase App.
- Khởi tạo Firestore.
- Khởi tạo Firebase Authentication.
- Khai báo các collection chính.
- Đưa các API cần thiết ra `window` để các file JavaScript khác sử dụng.

Các collection được sử dụng gồm:

- `booksCollection`
- `loansCollection`
- `usersCollection`

Ngoài ra, hệ thống còn dùng các collection `roles`, `usernames` và `authUsers` để phục vụ phân quyền và ánh xạ tài khoản.

## 4.4. Lập trình các chức năng chính

### 4.4.1. Chức năng đăng nhập và quản lý phiên

Hệ thống hỗ trợ:

- Đăng nhập bằng tài khoản người dùng.
- Kiểm tra trạng thái đăng nhập.
- Khôi phục mật khẩu bằng email.
- Đổi mật khẩu.
- Đồng bộ dữ liệu tài khoản cũ sang Firebase Authentication.

### 4.4.2. Chức năng tra cứu sách

Người dùng có thể tìm kiếm theo:

- Tên sách.
- Tác giả.

Danh sách sách được hiển thị dạng thẻ, có ảnh bìa, tên sách, tác giả, tồn kho và nút thao tác phù hợp với vai trò hiện tại.

### 4.4.3. Chức năng mượn - trả sách

Khi độc giả đăng ký mượn, hệ thống tạo phiếu mượn có trạng thái chờ duyệt. Quản trị viên có thể duyệt yêu cầu để chuyển phiếu sang trạng thái đang mượn hoặc từ chối nếu không hợp lệ.

Khi trả sách, hệ thống:

- Xác nhận phiếu mượn.
- Kiểm tra số ngày quá hạn.
- Tính phí phạt nếu chức năng phạt được bật.
- Cập nhật trạng thái phiếu mượn.
- Cộng lại số lượng tồn kho sách.

### 4.4.4. Chức năng quản lý sách

Quản trị viên có thể:

- Thêm sách mới.
- Sửa thông tin sách.
- Xóa sách.
- Lọc sách theo nhiều tiêu chí.
- Sắp xếp sách theo tồn kho, tên hoặc thời gian thêm.
- Import sách từ Excel/CSV.
- Export danh sách sách.
- Tải file mẫu import.

### 4.4.5. Chức năng quản lý độc giả

Quản trị viên có thể:

- Tạo tài khoản độc giả hoặc giảng viên.
- Khóa tài khoản.
- Mở khóa tài khoản.
- Xem lịch sử mượn của từng người dùng.

### 4.4.6. Chức năng thống kê

Dashboard thống kê các chỉ số:

- Tổng đầu sách.
- Tổng tồn kho.
- Số sách đang cho mượn.
- Số đầu sách sắp hết.
- Danh sách sách có tồn kho thấp.

## 4.5. Triển khai hệ thống

Hệ thống có thể triển khai bằng Firebase Hosting. File `firebase.json` cấu hình thư mục public là thư mục gốc dự án và thiết lập cache-control cho `index.html`, file JavaScript và CSS.

Quy trình triển khai cơ bản:

1. Đăng nhập Firebase CLI.
2. Cấu hình project trong `.firebaserc`.
3. Kiểm tra `firebase.json`.
4. Deploy hosting và Firestore rules.
5. Mở URL Firebase Hosting để kiểm tra giao diện.

## 4.6. Kiểm thử chức năng

| STT | Chức năng kiểm thử | Kết quả mong đợi |
| --- | --- | --- |
| 1 | Tìm kiếm sách theo tên | Hiển thị đúng các sách có tên phù hợp. |
| 2 | Tìm kiếm sách theo tác giả | Hiển thị đúng các sách có tác giả phù hợp. |
| 3 | Đăng nhập tài khoản độc giả | Hiển thị khu vực cá nhân và cho phép mượn sách. |
| 4 | Đăng ký mượn sách | Tạo phiếu mượn trạng thái chờ duyệt. |
| 5 | Admin duyệt mượn | Phiếu chuyển sang đang mượn và tồn kho được cập nhật. |
| 6 | Admin từ chối mượn | Phiếu chuyển sang trạng thái bị từ chối. |
| 7 | Xác nhận trả sách | Phiếu chuyển sang đã trả và tồn kho tăng lại. |
| 8 | Tính phí quá hạn | Hiển thị số ngày quá hạn và tiền phạt tương ứng. |
| 9 | Thêm sách | Sách mới xuất hiện trong danh sách. |
| 10 | Import Excel/CSV | Dữ liệu hợp lệ được thêm vào Firestore. |
| 11 | Tạo tài khoản độc giả | Tài khoản mới có thể đăng nhập. |
| 12 | Khóa tài khoản | Tài khoản bị khóa không thể thực hiện mượn sách. |
| 13 | Xem dashboard | Các chỉ số thống kê được cập nhật đúng. |

---

# CHƯƠNG V - ĐÁNH GIÁ VÀ SO SÁNH HIỆU NĂNG HỆ THỐNG

## 5.1. Đánh giá chức năng

Hệ thống đã đáp ứng các chức năng chính của một ứng dụng quản lý thư viện cơ bản:

- Người dùng có thể tra cứu sách nhanh.
- Độc giả có thể đăng ký mượn và theo dõi lịch sử mượn - trả.
- Quản trị viên có thể duyệt mượn, quản lý trả sách và xử lý quá hạn.
- Dữ liệu sách và người dùng được quản lý tập trung.
- Dashboard hỗ trợ nắm bắt tình trạng tổng quan.

Các chức năng quản trị như import/export Excel, lọc sách, quản lý độc giả và khóa tài khoản giúp hệ thống có tính ứng dụng cao hơn so với một trang tra cứu sách đơn thuần.

## 5.2. Đánh giá giao diện và trải nghiệm người dùng

Giao diện được thiết kế theo hướng đơn giản, dễ thao tác:

- Trang chủ tập trung vào chức năng tìm kiếm sách.
- Các chức năng quản trị được nhóm trong sidebar riêng.
- Dữ liệu dạng bảng giúp admin dễ quan sát.
- Modal giúp thao tác thêm/sửa hoặc xem chi tiết không cần rời trang.
- Toast thông báo giúp người dùng biết kết quả thao tác.
- Menu mobile hỗ trợ truy cập trên thiết bị nhỏ.

Tuy nhiên, giao diện vẫn có thể cải tiến thêm về tính nhất quán, biểu đồ thống kê, bộ lọc nâng cao và tối ưu hiển thị trên nhiều kích thước màn hình.

## 5.3. Đánh giá hiệu năng tải dữ liệu

Với quy mô dữ liệu nhỏ đến trung bình, cách tải dữ liệu từ Firestore về frontend đáp ứng được nhu cầu sử dụng. Hệ thống có phân trang danh sách sách trên giao diện, giúp giảm số lượng thẻ sách hiển thị cùng lúc.

Các điểm tích cực:

- Không cần backend riêng nên triển khai nhanh.
- Firestore hỗ trợ đồng bộ dữ liệu và truy vấn theo collection.
- Frontend render trực tiếp, phù hợp quy mô môn học.

Các điểm cần tối ưu khi dữ liệu lớn:

- Cần phân trang dữ liệu ở tầng Firestore thay vì tải toàn bộ collection.
- Cần tạo index phù hợp cho các truy vấn lọc/sắp xếp.
- Cần tách nhỏ module JavaScript để dễ bảo trì.
- Cần tối ưu số lần đọc Firestore để giảm chi phí và tăng tốc độ.

## 5.4. Đánh giá bảo mật và phân quyền

Hệ thống đã sử dụng Firebase Authentication và Firestore Rules để kiểm soát quyền. Đây là điểm quan trọng vì dữ liệu được truy cập trực tiếp từ frontend.

Các điểm đã thực hiện:

- Chỉ admin được ghi dữ liệu sách.
- Người dùng chỉ được xem hồ sơ và phiếu mượn của chính mình.
- Admin được quản lý người dùng và phiếu mượn.
- Vai trò admin được xác định bằng collection `roles`.
- Các truy cập ngoài phạm vi bị từ chối mặc định.

Các điểm có thể cải tiến:

- Tách rõ hơn vai trò admin, thủ thư, giảng viên và sinh viên.
- Ghi log thao tác quản trị để truy vết.
- Kiểm tra dữ liệu đầu vào chặt hơn ở cả frontend và rules.
- Bổ sung giới hạn tốc độ hoặc cơ chế chống thao tác lặp.

## 5.5. So sánh với phương pháp quản lý thủ công

| Tiêu chí | Quản lý thủ công | Hệ thống thư viện trực tuyến |
| --- | --- | --- |
| Tra cứu sách | Mất thời gian, phụ thuộc sổ/bảng tính | Tìm kiếm nhanh theo tên hoặc tác giả |
| Theo dõi tồn kho | Dễ sai lệch khi cập nhật chậm | Cập nhật tập trung trên Firestore |
| Duyệt mượn | Phải xử lý trực tiếp | Duyệt/từ chối trên giao diện admin |
| Lịch sử mượn | Khó tra cứu | Lưu theo từng phiếu mượn |
| Quá hạn và phí phạt | Dễ nhầm khi tính thủ công | Có hàm tính số ngày quá hạn và phí |
| Thống kê | Tốn nhiều thời gian tổng hợp | Dashboard hiển thị tự động |
| Phân quyền | Khó kiểm soát nếu dùng file chung | Có Firebase Auth và Firestore Rules |
| Khả năng mở rộng | Hạn chế | Có thể mở rộng thêm chức năng |

## 5.6. Hạn chế của hệ thống

Một số hạn chế hiện tại:

- Chưa có thanh toán phí phạt trực tuyến.
- Chưa có thông báo tự động qua email khi gần đến hạn trả.
- Báo cáo thống kê mới dừng ở mức biểu đồ trực quan trên dashboard, chưa xuất báo cáo học kỳ/khoa dạng file.
- Dữ liệu lớn cần tối ưu truy vấn Firestore và phân trang server-side.
- Một số nội dung tĩnh như tin tức vẫn còn ở mức minh họa.

---

# CHƯƠNG VI - KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN ĐỀ TÀI

## 6.1. Kết quả đạt được

Sau quá trình thực hiện, đề tài đã xây dựng được hệ thống thư viện trực tuyến với các chức năng cơ bản và cần thiết:

- Hoàn thiện giao diện trang chủ, giới thiệu, trợ giúp và liên hệ.
- Xây dựng chức năng tìm kiếm và hiển thị danh sách sách.
- Xây dựng chức năng đăng nhập, quên mật khẩu và đổi mật khẩu.
- Xây dựng chức năng đăng ký mượn, duyệt mượn, trả sách và lịch sử mượn - trả.
- Xây dựng chức năng quản lý đầu sách, import/export Excel và lọc dữ liệu.
- Xây dựng chức năng quản lý độc giả và khóa/mở tài khoản.
- Xây dựng dashboard thống kê tổng quan.
- Bổ sung đặt trước sách khi hết tồn kho, sách yêu thích và thông báo trong hệ thống.
- Bổ sung mã QR/mã vạch cho đầu sách, nhật ký thao tác quản trị và vai trò thủ thư.
- Bổ sung biểu đồ thống kê theo tháng, trạng thái phiếu mượn, sách được mượn nhiều và khoa/lớp.
- Tích hợp Firebase Authentication, Cloud Firestore và Firebase Hosting.
- Thiết lập Firestore Rules để kiểm soát quyền truy cập dữ liệu.

Hệ thống đáp ứng mục tiêu ban đầu là xây dựng một ứng dụng web quản lý thư viện trực tuyến phục vụ học tập, nghiên cứu và minh họa quy trình nghiệp vụ thư viện.

## 6.2. Những khó khăn trong quá trình thực hiện

Một số khó khăn trong quá trình xây dựng hệ thống:

- Thiết kế luồng mượn - trả cần đảm bảo tồn kho được cập nhật chính xác.
- Phân quyền Firestore cần chặt chẽ vì frontend truy cập trực tiếp vào cơ sở dữ liệu.
- Quản lý trạng thái phiếu mượn cần xử lý nhiều trường hợp như chờ duyệt, đang mượn, đã trả và bị từ chối.
- Import dữ liệu sách từ Excel/CSV cần kiểm tra lỗi, dữ liệu trùng và định dạng không hợp lệ.
- Việc đồng bộ tài khoản cũ với Firebase Authentication cần xử lý cẩn thận để không ảnh hưởng người dùng.

## 6.3. Hướng phát triển trong tương lai

Trong tương lai, hệ thống có thể được phát triển theo các hướng:

- Gửi email tự động khi yêu cầu mượn được duyệt, sách gần đến hạn hoặc quá hạn.
- Tích hợp thanh toán trực tuyến cho phí phạt.
- Xây dựng báo cáo thống kê nâng cao có xuất file theo học kỳ, khoa hoặc nhóm người dùng.
- Xây dựng backend riêng cho các nghiệp vụ quan trọng như import hàng loạt, tính phạt định kỳ và ghi log.
- Tối ưu truy vấn Firestore khi số lượng sách, người dùng và phiếu mượn tăng lớn.
- Tối ưu thêm giao diện dashboard và bộ lọc báo cáo khi dữ liệu lớn.

---

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Giải thích |
| --- | --- |
| API | Application Programming Interface - giao diện lập trình ứng dụng. |
| CSS | Cascading Style Sheets - ngôn ngữ định kiểu giao diện web. |
| CSV | Comma-Separated Values - định dạng dữ liệu bảng phân tách bằng dấu phẩy. |
| DOM | Document Object Model - mô hình đối tượng tài liệu HTML. |
| HTML | HyperText Markup Language - ngôn ngữ đánh dấu siêu văn bản. |
| JS | JavaScript - ngôn ngữ lập trình phía client trong dự án. |
| UID | User Identifier - mã định danh người dùng trong Firebase Authentication. |
| UI | User Interface - giao diện người dùng. |
| XLSX | Định dạng file Excel. |

---

# TÀI LIỆU THAM KHẢO

1. Firebase Documentation, https://firebase.google.com/docs
2. Cloud Firestore Documentation, https://firebase.google.com/docs/firestore
3. Firebase Authentication Documentation, https://firebase.google.com/docs/auth
4. Firebase Hosting Documentation, https://firebase.google.com/docs/hosting
5. MDN Web Docs - HTML, CSS, JavaScript, https://developer.mozilla.org
6. SheetJS Documentation, https://docs.sheetjs.com
7. Google Books APIs, https://developers.google.com/books
