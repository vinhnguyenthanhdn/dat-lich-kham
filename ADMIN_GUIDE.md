# Hướng dẫn sử dụng Admin Dashboard

## Truy cập Admin

1. **URL đăng nhập**: `https://bsvan.vercel.app/admin/login`
2. **Mật khẩu mặc định**: `admin123`

⚠️ **LƯU Ý BẢO MẬT**: Hãy thay đổi mật khẩu trong file `src/pages/AdminLogin.tsx` dòng 5:
```typescript
const ADMIN_PASSWORD = 'admin123'; // Thay đổi mật khẩu này
```

## Các tính năng

### 1. Dashboard (Trang tổng quan)
- **Thống kê tổng hợp**:
  - Tổng số lịch hẹn
  - Số lịch hôm nay
  - Số lịch tháng này
  - Số lịch chờ xác nhận

- **Biểu đồ**: Xem số lượng lịch hẹn theo ngày (30 ngày gần đây)

- **Lịch hôm nay**: Danh sách bệnh nhân có lịch khám hôm nay
- **Lịch ngày mai**: Danh sách bệnh nhân có lịch khám ngày mai

### 2. Danh sách bệnh nhân
- **Xem toàn bộ lịch hẹn** với phân trang (20 lịch/trang)
- **Tìm kiếm** theo:
  - Tên bệnh nhân
  - Tên phụ huynh
  - Số điện thoại

- **Lọc theo trạng thái**:
  - Tất cả
  - Chờ xác nhận
  - Đã xác nhận
  - Đã hủy

- **Quản lý**:
  - Thay đổi trạng thái lịch hẹn
  - Xóa lịch hẹn

## Cấu hình Supabase

### Row Level Security (RLS) cho Admin

Để admin có thể đọc tất cả dữ liệu, chạy SQL sau trong Supabase SQL Editor:

```sql
-- Policy cho phép đọc tất cả appointments (không cần auth)
DROP POLICY IF EXISTS "Enable read for all users" ON appointments;
CREATE POLICY "Enable read for all users" ON appointments
  FOR SELECT
  USING (true);

-- Policy cho phép update status
DROP POLICY IF EXISTS "Enable update for all users" ON appointments;
CREATE POLICY "Enable update for all users" ON appointments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy cho phép delete
DROP POLICY IF EXISTS "Enable delete for all users" ON appointments;
CREATE POLICY "Enable delete for all users" ON appointments
  FOR DELETE
  USING (true);
```

⚠️ **Lưu ý**: Các policy này cho phép mọi người đọc/sửa/xóa. Trong production thực tế, bạn nên:
1. Tạo bảng `admin_users` với authentication
2. Giới hạn policy chỉ cho admin users
3. Hoặc sử dụng Supabase Auth với RLS policies dựa trên roles

## Cấu trúc database

### Bảng `appointments`

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name TEXT NOT NULL,
  patient_dob TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  patient_address TEXT,
  patient_phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_phone ON appointments(patient_phone);
```

## Deploy lên Vercel

Đừng quên thêm environment variables trong Vercel Dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Bảo mật

### Khuyến nghị:
1. **Thay đổi mật khẩu admin** trong code
2. **Giới hạn IP** truy cập admin nếu có thể
3. **Sử dụng HTTPS** (Vercel tự động cung cấp)
4. **Backup database** định kỳ từ Supabase
5. **Monitor logs** để phát hiện truy cập bất thường

### Nâng cao (optional):
- Tích hợp Supabase Auth thay vì mật khẩu đơn giản
- Thêm 2FA (Two-Factor Authentication)
- Tạo audit log để theo dõi các thay đổi
- Rate limiting để chống brute force

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console trong DevTools (F12)
2. Kiểm tra Supabase logs
3. Kiểm tra Vercel deployment logs
