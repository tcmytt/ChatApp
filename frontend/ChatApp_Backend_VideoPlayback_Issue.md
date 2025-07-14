# Vấn đề: Video gửi thành công nhưng không phát được trong chat nhóm

## 1. Mô tả lỗi
- Upload file video .mp4 thành công, cả người gửi và người nhận đều nhận được message video trong chat.
- Tuy nhiên, khi bấm xem video thì chỉ hiện 0:00, màn hình xám/tối, không phát được.
- Reload lại cũng không phát được.
- Nếu tải file video từ server về máy, có thể cũng không mở được.

## 2. Phân tích nguyên nhân
- **A. File upload lên server bị lỗi, không phải file video hợp lệ:**
  - Backend lưu file bị lỗi (ghi sai nhị phân, file bị cắt ngắn, lỗi IO, ...).
- **B. Backend trả về file video nhưng thiếu hoặc sai Content-Type:**
  - Khi truy cập URL video, header không phải `Content-Type: video/mp4`.
- **C. CORS hoặc quyền truy cập file video bị chặn:**
  - Thường sẽ báo lỗi rõ ràng trên console/network tab.
- **D. Reverse proxy (Nginx/Apache) chặn hoặc thay đổi header file video.**

## 3. Hướng dẫn kiểm tra & khắc phục

### A. Kiểm tra file thực tế trên server
- Vào thư mục `uploads/` trên backend, tải file .mp4 vừa upload về máy, mở thử bằng VLC/Windows Media Player.
  - Nếu không mở được: File bị lỗi khi lưu (cần kiểm tra lại code backend lưu file).
  - Nếu mở được: Chuyển sang kiểm tra Content-Type.

### B. Kiểm tra response header khi truy cập file
- Truy cập trực tiếp URL video (ví dụ: `http://localhost:8080/uploads/abc123.mp4`) trên trình duyệt.
- Mở tab Network, kiểm tra response header:
  - Content-Type phải là `video/mp4`.
  - Nếu là `application/octet-stream` hoặc thiếu Content-Type, cần cấu hình lại static resource backend.

### C. Kiểm tra code backend lưu file
- Đảm bảo backend **không thay đổi nội dung file** khi lưu (không đọc/ghi nhị phân thành text, không nén, không chuyển đổi gì).
- Đảm bảo dùng `file.transferTo(new File(...))` hoặc stream nhị phân đúng cách.

### D. Cấu hình static resource trả về đúng Content-Type (Spring Boot)
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/")
                .setCachePeriod(3600)
                .resourceChain(true);
    }
}
```
- Spring Boot sẽ tự động trả về Content-Type đúng nếu file lưu đúng đuôi `.mp4`.

### E. Kiểm tra quyền ghi thư mục uploads
- Đảm bảo backend có quyền ghi vào thư mục lưu file video.

### F. Nếu dùng reverse proxy (Nginx, Apache)
- Đảm bảo không chặn hoặc thay đổi header Content-Type khi trả file video.

## 4. Checklist cho backend
- [ ] File .mp4 upload lên server có mở được không?
- [ ] Truy cập URL video, response header có Content-Type: video/mp4 không?
- [ ] Code backend lưu file đúng nhị phân, không làm hỏng file?
- [ ] Nếu dùng reverse proxy, có chặn hoặc thay đổi header không?
- [ ] Đã kiểm tra quyền ghi thư mục uploads.

---

**Nếu cần ví dụ code hoặc cấu hình chi tiết hơn, hãy liên hệ frontend để được hỗ trợ!** 