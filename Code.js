const SHEET_ID = '1LLS2iXbgQzg9exlMlKLVZX9wGLqAcOcC2gBViVlqHRk';
const FOLDER_ID = '1jYM8DO6oInLYD3886TaDk2yY9XBYI9lm';
const SHEET_NAME = 'ThanhVien';

function doPost(e) {
  try {
    // Parse data từ Frontend gửi lên
    const data = JSON.parse(e.postData.contents);
    
    // 1. Xử lý lưu ảnh vào Google Drive
    let imageUrl = '';
    if (data.avatarBase64) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      const contentType = data.avatarMimeType || 'image/jpeg';
      const byteCharacters = Utilities.base64Decode(data.avatarBase64);
      const blob = Utilities.newBlob(byteCharacters, contentType, data.avatarName || 'avatar.jpg');
      
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      // Lấy link ảnh trực tiếp để dễ hiển thị trên AppSheet hoặc web sau này
      imageUrl = "https://drive.google.com/uc?id=" + file.getId(); 
    }
    
    // 2. Tạo Mã Thành Viên (12 ký tự ngẫu nhiên, số và chữ không trùng)
    const maThanhVien = generateUniqueId(12);
    
    // 3. Xử lý Số điện thoại & Mã Số Thành Viên (thêm dấu nháy đơn để giữ số 0 ở đầu)
    let soDienThoai = data.phone || '';
    const soDienThoaiLuuSheet = soDienThoai ? "'" + soDienThoai : ""; // Định dạng text cho SĐT
    
    let maSoThanhVienRaw = soDienThoai.length >= 5 ? soDienThoai.slice(-5) : soDienThoai;
    const maSoThanhVienLuuSheet = maSoThanhVienRaw ? "'" + maSoThanhVienRaw : ""; // Định dạng text cho Mã SĐT
    
    // 4. Các thông tin khác
    const tenThanhVien = data.name || '';
    const bietDanh = ''; // Frontend không có trường này, để trống
    const nguonDangKy = data.source || '';
    const mongMuon = data.desire || '';
    const tinhThanh = data.province || '';
    const namSinh = data.birthYear || '';
    const thoiGianDangKy = new Date();
    const ghiChu = ''; 
    const trangThai = 'Chờ duyệt';
    
    // 5. Ghi vào Google Sheets
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Thứ tự cột: MaThanhVien, MaSoThanhVien, TenThanhVien, BietDanh, HinhAnhDaiDien, NguonDangKy, MongMuon, TinhThanh, NamSinh, SoDienThoai, ThoiGianDangKy, GhiChu, TrangThai
    sheet.appendRow([
      maThanhVien,
      maSoThanhVienLuuSheet, // Đã fix giữ số 0
      tenThanhVien,
      bietDanh,
      imageUrl,
      nguonDangKy,
      mongMuon,
      tinhThanh,
      namSinh,
      soDienThoaiLuuSheet,   // Đã fix giữ số 0
      thoiGianDangKy,
      ghiChu,
      trangThai
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Đăng ký thành công' 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm hỗ trợ pre-flight request CORS cho Web App
function doOptions(e) {
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}

// Hàm tạo ID ngẫu nhiên
function generateUniqueId(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}