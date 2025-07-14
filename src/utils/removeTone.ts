export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD') // Tách thành chữ cái và dấu. Ví dụ: ă -> a + ̃  
    .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu (diacritics) từ U+0300 đến U+036F
    .replace(/đ/g, 'd') // Thay thế ký tự 'đ' thành 'd'
    .replace(/Đ/g, 'D') // Thay thế ký tự 'Đ' thành 'D' 
    .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng thành một khoảng trắng duy nhất
    .trim() // Xóa khoảng trắng ở đầu và cuối chuỗi
    .toLowerCase(); // Chuyển đổi toàn bộ chuỗi thành chữ thường
}