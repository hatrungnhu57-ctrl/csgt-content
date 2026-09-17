# CSGT Content - Trợ lý tuyên truyền TTATGT đường bộ

Ứng dụng chuyên nghiệp hỗ trợ lực lượng Cảnh sát giao thông quản lý, biên tập, kiểm duyệt, lưu trữ và theo dõi chỉ tiêu tin/bài tuyên truyền về trật tự, an toàn giao thông đường bộ.

---

## 🏛️ NGUYÊN TẮC NGHIỆP VỤ CỐT LÕI
**ĐÚNG – NGẮN – RÕ – AN TOÀN THÔNG TIN.**
Hệ thống hoạt động dưới cơ chế **Source-Lock (Khoá dữ liệu nguồn)**:
- AI **TUYỆT ĐỐI KHÔNG TỰ BỊA DỮ LIỆU**: Không tự thêm số liệu, thời gian, địa điểm, hành vi vi phạm, mức phạt hay căn cứ pháp luật.
- Nếu thiếu dữ liệu quan trọng, hệ thống trả về trạng thái `NEED_INFO` kèm danh sách trường thông tin cần cán bộ bổ sung.

---

## 🎯 CÁC TÍNH NĂNG CHÍNH (THEO MASTER PROMPT)

### 1. Dashboard & Theo dõi Chỉ tiêu (03 tin/bài/tháng)
- Theo dõi tiến độ thời gian thực: `Đã hoàn thành / Chỉ tiêu giao`.
- Phân loại rõ: *Đã đăng, Chờ duyệt, Bản nháp, Còn thiếu*.
- Cảnh báo chỉ tiêu thông minh theo mốc thời gian:
  - *Ngày 01–20*: Thông báo bình thường.
  - *Ngày 21–25*: Nhắc nhở cán bộ.
  - *Ngày 26 trở đi*: Cảnh báo khẩn cấp hoàn thành chỉ tiêu.
- Thống kê cơ cấu chủ đề để phát hiện & cảnh báo việc viết quá nhiều một đề tài.

### 2. Workflow Soạn tin/bài có cấu trúc (3 Bước)
- **Bước 1 - Chọn loại bài**: 16 nhóm bài tuyên truyền nghiệp vụ (*Nồng độ cồn, Tốc độ, Học sinh, Xe tải, Xe khách, Hỗ trợ người dân, TNGT...*).
- **Bước 2 - Nhập dữ liệu / Bóc tách báo cáo thô**:
  - Nhập form nghiệp vụ chuẩn hóa: Thông tin chính, Số liệu, Hành vi vi phạm (gắn trạng thái `VERIFIED` / `NOT VERIFIED`).
  - Chế độ **Dán báo cáo thô**: AI tự bóc tách số liệu, địa điểm, quân số, trường hợp vi phạm và đưa qua màn hình xác nhận trước khi tạo bài.
- **Bước 3 - Tạo bài & Trình soạn thảo khối (Block Editor)**:
  - Cấu trúc chuẩn: `TITLE` (ngắn gọn, có động từ) → `SAPO` (1-2 câu) → `BODY` (thời gian, địa điểm, diễn biến, kết quả) → `RECOMMENDATION` (khuyến cáo an toàn) → `HASHTAGS` (3-5 thẻ).
  - Công cụ viết lại AI có kiểm soát: *Rút ngắn, Trang trọng, Báo chí, Thân thiện, Nhấn mạnh tuyên truyền, Nhấn mạnh kết quả, Đổi 3 tiêu đề khác* (Tuyệt đối không thay đổi sự kiện).

### 3. Bộ lọc An toàn Thông tin & Ẩn danh (Privacy Sanitizer)
- Tự động viết tắt danh tính người vi phạm: `Nguyễn Văn An` → `N.V.A.`.
- Che 2 ký tự cuối biển số phương tiện bản công khai: `84H1-123.45` → `84H1-123.xx`.
- Tách biệt hoàn toàn `source_data` (dữ liệu nguồn gốc) và `public_content` (bản xuất bản công khai).
- Phát hiện và cảnh báo SĐT cá nhân, số CCCD/CMND, GPLX, địa chỉ chi tiết nhà riêng.

### 4. Kiểm duyệt & Thẩm định Độc lập (Fact Check AI)
- AI thứ hai đối chiếu từng dữ kiện với `source_snapshot`: `MATCHED`, `UNSUPPORTED`, `CONFLICT`.
- Kiểm tra tên đơn vị, quy cách danh xưng (viết đầy đủ "Cảnh sát giao thông" ở lần đầu, chặn ký hiệu nội bộ C08, PC08 khi đăng công khai).
- Guardrail tai nạn giao thông (TNGT): Chặn đứng mọi phỏng đoán nguyên nhân khi vụ việc đang trong giai đoạn điều tra.
- 3 trạng thái kiểm duyệt: `GREEN (Đủ điều kiện đăng)` | `YELLOW (Cần kiểm tra)` | `RED (Chưa nên đăng)`.

### 5. Kho Tin bài & Tìm kiếm Nghiệp vụ
- Tìm kiếm tức thì theo từ khóa, tiêu đề, nội dung, tháng/năm, chuyên đề, trạng thái bài viết.
- Cảnh báo trùng lặp nội dung (% tương đồng) kèm gợi ý thay đổi góc tiếp cận.
- Hỗ trợ sao chép toàn bộ bài (chuẩn Facebook/báo chí) và xuất file TXT.

### 6. Module Gợi ý Chủ đề Tuyên truyền
- Phân tích cơ cấu đề tài các tháng gần nhất và đề xuất 3-5 chủ đề mới.
- Chỉ gợi ý góc tuyên truyền và kiến thức pháp luật, **không bịa sự kiện/vụ việc giả**.

### 7. Module Chuyển thể Kịch bản Video Ngắn (9:16)
- Chuẩn dọc 9:16 thời lượng 30 - 60 giây (TikTok, Reels, Shorts).
- Xuất chi tiết: Timeline, Cảnh quay, Visual Text, Voice Over, Phụ đề, Gợi ý B-roll, Khuyến cáo và End card (quy cách logo CSGT góc trên bên trái).

### 8. Hồ sơ Đơn vị, Audit Logs & Lịch sử Phiên bản
- Quản lý hồ sơ đơn vị: tên đầy đủ, đơn vị cấp trên, địa bàn, cách ghi tên lực lượng.
- Lưu nhật ký kiểm toán (Audit Logs) mọi thao tác tạo, sửa, AI bóc tách, thẩm định và xuất bản.

---

## 🧪 BỘ TEST TỰ ĐỘNG (VERIFICATION SUITE)

Chạy lệnh kiểm thử:
```bash
node tests/run.mjs
```
Kết quả kiểm thử 6/6 kịch bản nghiệp vụ bắt buộc:
1. ✅ **Test 1**: Nguồn 8 vi phạm, bài ghi 10 vi phạm → **FAIL (CONFLICT)**.
2. ✅ **Test 2**: Nguồn không có số tiền phạt, bài ghi "phạt 5 triệu đồng" → **FAIL (UNSUPPORTED)**.
3. ✅ **Test 3**: Biển số `84H1-123.45` → Tự động che thành `84H1-123.xx`.
4. ✅ **Test 4**: Danh tính `Nguyễn Văn An` → Tự động viết tắt thành `N.V.A.`.
5. ✅ **Test 5**: Bài TNGT đang điều tra, AI tự ghi "do không chú ý quan sát" → **FAIL (Chặn phỏng đoán)**.
6. ✅ **Test 6**: Ký hiệu nội bộ `C08`, `Đội 6` → Cảnh báo yêu cầu danh xưng công khai đầy đủ.
