# HELI - ANONYMOUS MENTAL WELLNESS & SAFETY PLATFORM
### HỆ THỐNG CHIA SẺ TÂM SỰ ẨN DANH HYBRID P2P & TRỢ LÝ AI AN TOÀN

[![VKU Graduation Project](https://img.shields.io/badge/VKU-DACS4%20Capstone-blue.svg)](http://vku.udn.vn/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5+-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20DataChannel-red.svg)](https://webrtc.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%201.5-blueviolet.svg)](https://ai.google.dev/)

---

## 🎓 THÔNG TIN ĐỒ ÁN TỐT NGHIỆP / ĐỒ ÁN CHUYÊN NGÀNH
- **Cơ sở đào tạo:** Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (**VKU**), Đại học Đà Nẵng
- **Khoa:** Khoa học Máy tính
- **Học phần:** Đồ án Chuyên ngành 4 (DACS4) / Đồ án Tốt nghiệp
- **Đề tài:** *Hệ thống chia sẻ tâm sự ẩn danh hỗ trợ giải tỏa tâm lý ứng dụng mô hình Hybrid P2P và AI kiểm duyệt nội dung*
- **Sinh viên thực hiện (Lớp 24GITe):**
  1. **Trương Minh Nhật Khánh** – Mã SV: **24ITE047**
  2. **Lê Thị Hồng Hạnh** – Mã SV: **24ITE034**
- **Cán bộ hướng dẫn:** **TS. Lý Quỳnh Trân**
- *Đà Nẵng, Năm 2026*

---

## 🌟 ĐẶC ĐIỂM NỔI BẬT & ĐIỂM SÁNG TẠO CỦA ĐỀ TÀI

1. **Khôi phục tài khoản hoàn toàn ẩn danh qua Recovery Code HMAC-SHA256 ($O(1)$)**:
   - Giải quyết triệt để bài toán: *"Làm sao khôi phục tài khoản khi quên mật khẩu mà không cần thu thập Email hay Số điện thoại (Zero PII)?"*.
   - Sử dụng hàm sinh ngẫu nhiên an toàn mật mã `crypto.randomBytes(16)` kết hợp hàm băm xác định **HMAC-SHA256**.
   - Tra cứu trên chỉ mục cơ sở dữ liệu với tốc độ hằng số **$O(1)$**, khắc phục hoàn toàn nhược điểm nghẽn cổ chai $O(N)$ của bcrypt truyền thống.

2. **Quyền riêng tư tuyệt đối với kiến trúc P2P WebRTC (Zero Server Storage)**:
   - Các cuộc trò chuyện 1-1 riêng tư kết nối trực tiếp qua kênh dữ liệu **RTCDataChannel** (mã hóa DTLS/SCTP).
   - Máy chủ trung tâm chỉ làm nhiệm vụ báo hiệu (**Signaling Broker**) để bắt tay phiên. Toàn bộ nội dung tin nhắn chỉ nằm trong bộ nhớ RAM tạm thời của 2 trình duyệt máy khách, **hoàn toàn không lưu trữ log tin nhắn vào CSDL máy chủ**. Đóng tab là dữ liệu tự hủy sạch sẽ.

3. **Hệ thống Trí tuệ Nhân tạo 2 lớp (Dual-Tier AI Engine - Google Gemini 1.5)**:
   - **Lớp 1 - AI Safety Shield**: Quét trước nội dung bài viết và tin nhắn, phát hiện các nguy cơ tự hại, ngôn từ thù ghét, bẫy việc làm bất thường hoặc mua bán người qua biên giới. Tự động hiển thị hộp thoại khẩn cấp kết nối tới Tổng đài Quốc gia 111 và Đường dây nóng Ngày Mai 1900 6006.
   - **Lớp 2 - AI Heli Buddy**: Trợ lý tâm lý độc lập 24/7, duy trì ngữ cảnh trò chuyện đa lượt, phân tích cảm xúc và hướng dẫn các kỹ thuật chánh niệm (thở 4-7-8, tiếp đất 5-4-3-2-1).

4. **Chế độ bài viết linh hoạt (Công khai vs "Chỉ mình tôi") & Tương tác đa cấp**:
   - Tùy chọn `is_private = 1` biến bài viết thành cuốn nhật ký trị liệu cảm xúc cá nhân an toàn.
   - Bình luận phân cấp đệ quy nhiều tầng (`parent_id`) kết hợp tương tác thả tim đồng cảm (`post_likes`) và lưu bài viết (`saved_posts`).
   - Hỗ trợ tranh minh họa cảm xúc chất lượng cao (SVG) và bộ nhận diện avatar ẩn danh đa dạng.

5. **Quản trị thời gian thực với cơ chế ngắt Socket chủ động (Active Socket Lockout)**:
   - Khi Admin khóa tài khoản vi phạm, hệ thống cập nhật CSDL đồng thời phát sự kiện qua WebSocket ngắt kết nối client và hủy token trong vòng **< 500ms**, cô lập ngay lập tức các tác nhân xấu.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG (HYBRID ARCHITECTURE)

```
[ Trình duyệt Client A ] <==== (WebRTC P2P DataChannel Encrypted) ====> [ Trình duyệt Client B ]
          |                                                                      |
    (HTTPS / WSS)                                                          (HTTPS / WSS)
          |                                                                      |
          v                                                                      v
+-----------------------------------------------------------------------------------------+
|                                HELI APPLICATION SERVER                                  |
|   - Node.js & Express.js REST API            - Socket.IO WebRTC Signaling Broker        |
|   - Xác thực JWT & Phân quyền Role Guard     - Cơ chế ngắt kết nối Socket tức thời      |
|   - Tích hợp Google Gemini AI 1.5 SDK        - Lá chắn phát hiện nguy cơ Safety Shield  |
+-----------------------------------------------------------------------------------------+
          |                                                                      |
          v                                                                      v
[ Cơ sở Dữ liệu MySQL (11 Bảng 3NF) ]                           [ Google Gemini 1.5 Pro / Flash ]
(Tài khoản, Bài viết, Bình luận, Báo cáo)                       (Phân tích cảm xúc & Kiểm duyệt)
```

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
DACS4/
├── client/                                # Ứng dụng Frontend (React.js + TailwindCSS)
│   ├── public/                            # Tài nguyên tĩnh
│   │   ├── images/
│   │   │   ├── avatars/                   # 8 avatar SVG ẩn danh (cat, fox, bird, moon,...)
│   │   │   └── posts/                     # 7 tranh minh họa cảm xúc (study, rain, sunset,...)
│   │   ├── favicon.svg                    # Icon website
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/axiosClient.js             # Axios cấu hình withCredentials
│   │   ├── components/                    # Thành phần giao diện dùng lại
│   │   │   ├── Navbar.jsx                 # Thanh điều hướng chuẩn Upstash style
│   │   │   ├── AuthModal.jsx              # Đăng ký / Đăng nhập
│   │   │   ├── PostCard.jsx               # Thẻ bài viết kèm ảnh & bình luận đa cấp
│   │   │   ├── CreatePostModal.jsx        # Đăng bài kèm bộ chọn ảnh minh họa
│   │   │   ├── ProfileModal.jsx           # Hồ sơ cá nhân & đổi avatar/mật khẩu
│   │   │   ├── RecoveryCodeModal.jsx      # Lưu trữ Recovery Code
│   │   │   ├── RecoverAccountModal.jsx    # Khôi phục tài khoản
│   │   │   ├── ReportPostModal.jsx        # Báo cáo vi phạm bài viết
│   │   │   └── SafetyShieldModal.jsx      # Hộp thoại cảnh báo AI Safety Shield
│   │   ├── contexts/AuthContext.jsx       # State quản lý đăng nhập & socket
│   │   ├── pages/                         # Các trang chính
│   │   │   ├── FeedPage.jsx               # Bảng tin cộng đồng & lọc tâm trạng
│   │   │   ├── MyPostsPage.jsx            # Bài viết cá nhân & nhật ký riêng tư
│   │   │   ├── P2PChatPage.jsx            # Phòng chat P2P WebRTC 1-1 (Sảnh danh sách người muốn tâm sự, Chế độ Chấp nhận tâm sự, Chọn người trò chuyện & Ghép ngẫu nhiên)
│   │   │   ├── AdminLoginPage.jsx         # Đăng nhập Admin
│   │   │   └── AdminDashboardPage.jsx     # Bảng điều khiển quản trị thời gian thực
│   │   ├── utils/webrtc.js                # Lớp xử lý PeerConnection & DataChannel
│   │   ├── App.jsx                        # Quản lý Router & Modal cấp cao
│   │   └── main.jsx                       # Entry point React
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                                # Ứng dụng Backend (Node.js + Express)
│   ├── data/
│   │   └── store.json                     # Local persistent store (tự động fallback khi offline MySQL)
│   ├── src/
│   │   ├── config/                        # Cấu hình hệ thống
│   │   │   ├── db.js                      # MySQL Pool & tự động migration cấu trúc
│   │   │   ├── env.js                     # Biến môi trường
│   │   │   └── iceServers.js              # Cấu hình STUN/TURN
│   │   ├── middleware/                    # auth, admin, rateLimiter, socketAuth
│   │   ├── models/                        # userModel, postModel, commentModel, safetyModel
│   │   ├── routes/                        # authRoutes, postRoutes, aiRoutes, adminRoutes
│   │   ├── services/                      # aiModerationService, safetyShieldService
│   │   ├── sockets/                       # signalingHandler.js (WebRTC & ngắt socket)
│   │   └── server.js                      # Entry point Express & Socket.IO
│   ├── database.sql                       # Toàn bộ schema CSDL & Dữ liệu mẫu
│   ├── seedData.js                        # Script nạp nhanh Mock Data & Image Assets
│   ├── generateAssets.js                  # Script tạo tài nguyên ảnh SVG
│   ├── package.json
│   └── .env.example
│
├── docs/                                  # TÀI LIỆU HỌC THUẬT & BẢO VỆ ĐỒ ÁN
│   ├── BAO_CAO_DO_AN_DACS4_HOAN_CHINH.docx # Báo cáo tốt nghiệp Word chuẩn in ấn VKU
│   ├── BAO_CAO_DO_AN_DACS4_HOAN_CHINH.md   # Báo cáo tốt nghiệp bản Markdown chi tiết
│   ├── SLIDES_DEFENSE_PRESENTATION_EN.html # Slide bảo vệ Web tương tác (Tiếng Anh)
│   ├── SLIDES_DEFENSE_PRESENTATION_EN.md   # Slide bảo vệ chuẩn Marp Markdown (Tiếng Anh)
│   ├── Hinh_3_2_1_Use_Case_Tong_Quat.drawio
│   ├── Hinh_3_2_2_Use_Case_Xac_Thuc_Tai_Khoan.drawio
│   ├── Hinh_3_2_3_Use_Case_Cong_Dong_Tam_Su.drawio
│   ├── Hinh_3_2_4_Use_Case_Tro_Ly_AI_Heli.drawio
│   ├── Hinh_3_2_5_Use_Case_AI_Safety_Shield.drawio
│   ├── Hinh_3_2_6_Use_Case_Chat_P2P_WebRTC.drawio
│   ├── Hinh_3_2_7_Use_Case_Quan_Tri_Admin.drawio
│   ├── Hinh_3_3_1_Activity_Dang_Bai_Kiem_Duyet_AI.drawio
│   ├── Hinh_3_3_2_Activity_Khoi_Phuc_Recovery_Code.drawio
│   ├── Hinh_3_3_3_Activity_Quet_Rui_Ro_Safety_Shield.drawio
│   ├── Hinh_3_3_4_Activity_Admin_Khoa_Tai_Khoan.drawio
│   ├── Hinh_3_4_ERD_Co_So_Du_Lieu.drawio
│   ├── Hinh_3_5_Class_Diagram.drawio
│   └── SO_DO_TONG_HOP_TOAN_BO_BAO_CAO.drawio
│
├── database.sql                           # Bản sao đồng bộ CSDL tại thư mục gốc
├── requirements.txt                       # Thư viện Python phục vụ tự động hóa báo cáo
├── start.bat                              # File batch 1-click khởi chạy toàn bộ hệ thống
└── README.md                              # Tài liệu hướng dẫn dự án
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY DỰ ÁN

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản 18.x trở lên.
- **MySQL**: Phiên bản 8.0 (nếu dùng MySQL, hệ thống có sẵn cơ chế fallback chạy độc lập với `store.json` không bắt buộc phải bật MySQL khi demo).
- **Python**: Phiên bản 3.10+ (tùy chọn, dùng để chỉnh sửa tài liệu hoặc chạy script docx).

---

### Cách 1: Khởi chạy 1-Click bằng file `start.bat` (Khuyên dùng)
Tại thư mục gốc dự án `D:\DACS4`, chỉ cần **nhấp đúp chuột vào file `start.bat`**:
- Cửa sổ 1: Tự động khởi động Backend Server tại `http://localhost:5000`.
- Cửa sổ 2: Tự động khởi động Frontend Client tại `http://localhost:5173`.

---

### Cách 2: Khởi chạy thủ công từng phần

#### Bước 1: Cài đặt thư viện Backend & Khởi chạy:
```bash
cd server
npm install
npm start
```
- Server Backend hoạt động tại: **`http://localhost:5000`**
- API Health Check: **`http://localhost:5000/api/health`**

#### Bước 2: Cài đặt thư viện Frontend & Khởi chạy:
Mở một terminal mới:
```bash
cd client
npm install
npm run dev
```
- Truy cập giao diện Web tại: **`http://localhost:5173`**

#### Bước 3: Cài đặt thư viện Python (Nếu cần xuất lại báo cáo):
```bash
pip install -r requirements.txt
```

---

## 💾 CƠ SỞ DỮ LIỆU & NẠP DỮ LIỆU MẪU (MOCK DATA)

Hệ thống đã chuẩn bị sẵn bộ dữ liệu mẫu gồm 12 tài khoản, 9 bài viết tâm sự kèm tranh minh họa, 17 bình luận đa cấp, lượt thích và nhật ký cảnh báo an toàn.

Để nạp mới hoặc reset lại toàn bộ dữ liệu mẫu bất kỳ lúc nào, chỉ cần chạy lệnh:
```bash
node server/seedData.js
```
*(Lệnh trên sẽ tự động cập nhật cả `server/data/store.json` và chuẩn bị sẵn câu lệnh SQL trong `database.sql`).*

---

## 🔑 TÀI KHOẢN MẪU DÙNG ĐỂ DEMO & ĐÁNH GIÁ

| Tài khoản | Tên đăng nhập | Mật khẩu | Bút danh hiển thị | Vai trò (Role) | Chức năng kiểm thử |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin123` | Quản trị viên (Heli Admin) | `admin` | Vào tab **Quản trị**: Quản lý người dùng, xem nhật ký Safety Shield, khóa tài khoản tức thời |
| **Người dùng mẫu** | `demouser` | `123456` | Ánh Trăng | `user` | Đăng bài, xem bài riêng tư "Chỉ mình tôi", thích bài, lưu bài viết |
| **Cộng đồng 1** | `hoami_trang` | `123456` | Họa Mi Trắng | `user` | Bài viết Biết ơn (bác tài xế xe buýt) |
| **Cộng đồng 2** | `sinhvien_it2026` | `123456` | Sinh Viên Năm Cuối | `user` | Bài viết Áp lực đồ án DACS4 |
| **Tài khoản Khách** | *(Tự sinh)* | *(Dùng mã)* | *Anonymous_XXXX* | `user` | Khôi phục bằng Recovery Code $O(1)$ |

---

## 🧪 KỊCH BẢN KIỂM THỬ THỰC NGHIỆM ĐỒ ÁN (TEST SCENARIOS)

### Kịch bản 1: Đăng bài viết kèm tranh minh họa cảm xúc
1. Đăng nhập với tài khoản `demouser` / `123456`.
2. Nhấn nút **Chia sẻ tâm sự mới**.
3. Chọn nhãn tâm trạng: `Áp lực`, nhập nội dung chia sẻ.
4. Nhấn **+ Chọn ảnh gợi ý** -> Nhấp chọn bức tranh `Bàn học đêm` hoặc dán link ảnh tùy thích.
5. Nhấn **Chia sẻ tâm sự** -> Bài viết xuất hiện trên bảng tin với tranh minh họa bo tròn thẩm mỹ, kèm lời an ủi tự động từ **Heli AI Buddy**.

### Kịch bản 2: Bài viết riêng tư "Chỉ mình tôi" (Therapeutic Diary)
1. Trong modal đăng bài, bấm chuyển chế độ từ **Công khai** sang **Riêng tư**.
2. Đăng bài -> Bài viết được lưu với huy hiệu màu vàng `Chỉ mình tôi`.
3. Kiểm tra: Bài viết này chỉ hiển thị trong tab **Bài viết của tôi** của chính tác giả, hoàn toàn không xuất hiện trên Bảng tin của những người dùng khác.

### Kịch bản 3: Tương tác Cộng đồng & Bình luận đa cấp
1. Nhấn nút **Trái tim** để bày tỏ sự đồng cảm -> Bộ đếm tăng tức thì.
2. Nhấn nút **Lưu bài** để đưa bài viết vào thư viện yêu thích.
3. Nhấn **Bình luận** -> Nhập phản hồi vào ô chat. Bấm **Trả lời** trên một bình luận con để tạo cây thảo luận lồng nhau.

### Kịch bản 4: Phòng Chat 1-1 P2P WebRTC, Danh sách người muốn tâm sự & AI Safety Shield
**Cách 1: Trải nghiệm chọn bạn từ Danh sách (Hỗ trợ demo 1 máy mượt mà)**
1. Vào mục **Chat P2P**, hệ thống lập tức hiển thị **"Danh sách người muốn tâm sự"** kèm avatar, bút danh, tâm trạng và lời nhắn.
2. Bạn có toàn quyền chọn bất kỳ người bạn nào mình cảm thấy đồng điệu và nhấn **"Tâm sự với người này"** để kết nối ngay.
3. Khi trò chuyện, bạn có thể thử gửi tin nhắn có yếu tố đáng ngờ hoặc rủ rê việc làm:
   *"Em ơi qua Campuchia làm online lương 2000 USD, mai có xe đón tận nơi giấu bố mẹ nhé."*
4. Nhấn nút đỏ **AI Safety Shield** ở góc trên bên phải -> AI phân tích tức thì:
   - Cảnh báo cấp độ **DANGER** kèm dấu hiệu bẫy buôn người.
   - Nổi bật nút gọi khẩn cấp đến **Tổng đài Quốc gia 111** và **Đường dây nóng 1900 6006**.
   - Tin nhắn lưu hoàn toàn trong RAM trình duyệt, máy chủ không lưu trữ (Zero Server Storage).

**Cách 2: Chế độ "Chấp nhận tâm sự" & Ghép nối 2 tài khoản thực tế**
1. Mở 2 tab trình duyệt (Tab thường và Tab ẩn danh `Ctrl+Shift+N`).
2. Tab A: Chuyển sang tab **"Chấp nhận tâm sự"** -> Chọn tâm trạng "Lắng nghe" -> Bấm **"Bật trạng thái: Sẵn sàng chấp nhận tâm sự"**.
3. Tab B: Tại **"Danh sách người muốn tâm sự"**, lập tức xuất hiện thẻ của Tab A. Bấm **"Tâm sự với người này"**.
4. Tab A: Xuất hiện hộp thoại thông báo **"Lời mời tâm sự ẩn danh"** kèm chủ đề và lời nhắn. Nhấn **"Chấp nhận tâm sự"**.
5. Hai bên bắt tay WebRTC P2P DataChannel thành công và bước vào phòng trò chuyện riêng tư thời gian thực.

### Kịch bản 5: Bảng điều khiển Quản trị Admin & Khóa tài khoản tức thời
1. Đăng nhập tài khoản `admin` / `admin123` và vào tab **Quản trị**.
2. Quan sát biểu đồ thời gian thực: Tổng người dùng, số bài viết, số lượt cảnh báo an toàn.
3. Tìm một tài khoản vi phạm và nhấn **Khóa tài khoản**.
4. Phía máy khách của tài khoản bị khóa sẽ lập tức nhận sự kiện Socket, phiên đăng nhập bị hủy và bị điều hướng ra trang đăng nhập ngay lập tức trong vòng **< 500ms**.

---

## 📄 HỒ SƠ TÀI LIỆU BẢO VỆ ĐỒ ÁN (THESIS ARTIFACTS)

Tất cả các tài liệu chính thức đều được đặt tại thư mục [`docs/`](file:///D:/DACS4/docs/):
- **Báo cáo tốt nghiệp hoàn chỉnh:** [`docs/BAO_CAO_DO_AN_DACS4_HOAN_CHINH.docx`](file:///D:/DACS4/docs/BAO_CAO_DO_AN_DACS4_HOAN_CHINH.docx) *(Chuẩn in ấn 4 chương VKU, font Times New Roman, danh mục hình vẽ & bảng biểu)*.
- **Bản trình chiếu Slide bảo vệ Web (Tiếng Anh):** [`docs/SLIDES_DEFENSE_PRESENTATION_EN.html`](file:///D:/DACS4/docs/SLIDES_DEFENSE_PRESENTATION_EN.html) *(Mở trực tiếp trên Chrome/Edge để thuyết trình trước Hội đồng)*.
- **Bản Slide Marp Markdown:** [`docs/SLIDES_DEFENSE_PRESENTATION_EN.md`](file:///D:/DACS4/docs/SLIDES_DEFENSE_PRESENTATION_EN.md).
- **14 File sơ đồ thiết kế Draw.io:** Đặt tên và đánh số theo đúng chuẩn format học thuật VKU (`Hinh_3_2_1` đến `Hinh_3_5`).

---

## 🤝 LỜI CẢM ƠN
Nhóm tác giả xin chân thành cảm ơn sự hướng dẫn tận tâm và định hướng khoa học quý báu của **TS. Lý Quỳnh Trân** cùng quý Thầy, Cô Khoa Khoa học Máy tính - Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (**VKU**) đã hỗ trợ chúng em hoàn thành xuất sắc đồ án này.
