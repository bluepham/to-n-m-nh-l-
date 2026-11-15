# SMART WATER TANK 3D

**Thiết kế và mô phỏng bồn chứa nước 3D tương tác – Vận dụng tích phân trong Toán 12**

- **Đơn vị thực hiện:** Trường THPT Nguyễn Huệ
- **Giáo viên phụ trách:** Lê Văn Mạnh
- **Môn học – Chủ đề:** Toán 12 – Bộ sách *Kết nối tri thức với cuộc sống* – Chương IV: Nguyên hàm và tích phân – Bài 13: Ứng dụng hình học của tích phân
- **Quy mô tổ chức:** 40 học sinh (`HS01`–`HS40`) chia thành 4 nhóm thực hiện theo quy trình STEM 7 bước.

---

## 1. Các phân hệ chức năng chính

1. **Giới thiệu & Không gian Hợp tác STEM (`Giới thiệu`):**
   - Mô hình bồn nước 3D tương tác trực tiếp ngay tại màn hình chính.
   - Quản lý phân công 40 học sinh (`HS01`–`HS40`) thuộc 4 nhóm với lưu trữ `localStorage`, xuất/nhập tệp `.json`, nhật ký phiên bản xác nhận thủ công và bảng đối sánh thực nghiệm 3 công cụ AI (`Google AI Studio (Gemini)`, `Base44`, `Google Antigravity`).
   - Dashboard Giáo viên Lê Văn Mạnh (chấm rubric dự án thang 10 điểm, xuất CSV, in báo cáo) và Bộ 12 ca kiểm thử Toán học & chức năng tự động.
2. **Phòng Thiết kế 3D (`Thiết kế 3D`):**
   - Dựng hình khối tròn xoay thực bằng Three.js (`LatheGeometry`) từ hàm bán kính `r(z)` cho 4 loại bồn (`Hình trụ`, `Hình nón cụt`, `Thành cong`, `Hàm tùy chỉnh math.js`) cùng nút ví dụ chuẩn **Bán cầu `V = 16π/3`**.
   - Hỗ trợ chế độ Phòng thí nghiệm / Khuôn viên trường, mặt cắt dọc `r(z)`, bật/tắt khung đỡ – ống – van – thước đo và xuất mô hình `.GLB`.
3. **Phòng Tích phân Toán 12 (`Toán học`):**
   - Hiển thị 5 bước giải tích phân bằng KaTeX (công thức giải tích chính xác hoặc tích phân số Simpson/Gauss-Legendre).
   - Trình diễn trực quan 6 bước *"Từ đồ thị đến bồn nước 3D"* và Trợ lý Toán học (ngân hàng câu hỏi chuẩn ngoại tuyến kèm kết nối máy chủ Gemini tùy chọn).
4. **Mô phỏng Bơm – Xả (`Bơm – Xả`):**
   - Cập nhật thể tích `V(t + Δt) = V(t) + (Qv - Qr)Δt` và giải phương trình phi tuyến `π∫₀ʰ [r(z)]² dz = V` bằng phương pháp chia đôi để xác định mực nước thực `h(t)`.
5. **Hệ thống 4 Đồ thị Tương tác (`Đồ thị`):**
   - Gồm `r(z) & A(z)`, `V_water(h)`, `V(t)` và `dh/dt = (Qv - Qr)/A(h)` với chức năng nhấp chọn mực nước, phóng to, tải ảnh PNG và xuất dữ liệu CSV.
6. **Tối ưu Thiết kế & Luyện tập (`Tối ưu & Luyện tập`):**
   - Đối sánh phương án A/B theo tích phân diện tích mặt tròn xoay `S_side = 2π∫₀ᴴ r(z)√(1 + [r'(z)]²) dz` và quét lưới tham số hữu hạn.
   - Ghép nối công thức, thử thách thiết kế 3D và đề trắc nghiệm 10 câu Toán 12 tự chấm điểm.

---

## 2. Cài đặt và Chạy ứng dụng

```bash
# 1. Cài đặt thư viện phụ thuộc
npm install

# 2. Chạy kiểm thử đơn vị cho động cơ Toán học (MathEngine)
npm test

# 3. Khởi chạy máy chủ phát triển (cổng 3000)
npm run dev
```

*Cấu hình tùy chọn:* Nếu muốn bật chế độ hỏi đáp tự do qua máy chủ Gemini trong mục Trợ lý Toán học, sao chép `.env.example` thành `.env` và khai báo `GEMINI_API_KEY`. Toàn bộ tính năng mô hình 3D, tích phân, bơm – xả, đồ thị và kiểm thử vẫn hoạt động đầy đủ khi không có khóa API.

---

## 3. Đóng gói và Triển khai

```bash
# Biên dịch bản phân phối tĩnh vào thư mục dist/
npm run build

# Chạy máy chủ Express phục vụ bản build
npm start
```

Dự án có thể triển khai dưới dạng ứng dụng Node.js toàn phần (`npm start`) hoặc triển khai phần giao diện tĩnh `dist/` lên Vercel / Netlify / GitHub Pages (ở chế độ tĩnh, Trợ lý Toán học tự động sử dụng ngân hàng lời giải tích phân tích hợp sẵn).
