// Word Document (.doc / .docx compatible XML/HTML) Generator
// Standard Police Official Correspondence Format (Thể thức văn bản Công an nhân dân)

import { Article, UnitProfile } from '../store/types';

export function generatePoliceWordDocument(article: Article, unit: UnitProfile): void {
  const dateObj = new Date(article.created_at || Date.now());
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();

  const unitName = unit.full_name || 'Phòng Cảnh sát giao thông - Công an tỉnh Vĩnh Long';
  const parentUnit = unit.parent_unit || 'CÔNG AN TỈNH VĨNH LONG';
  const department = unit.department || 'PHÒNG CẢNH SÁT GIAO THÔNG (PC08)';
  const location = unit.location || 'Vĩnh Long';

  const title = article.public_content?.title || article.title;
  const sapo = article.public_content?.sapo || article.sapo;
  const body = article.public_content?.body || article.body;
  const rec = article.public_content?.recommendation || article.recommendation;
  const hashtags = (article.public_content?.hashtags || article.hashtags || []).join(' ');

  const src = article.source_snapshot || article.source_data;

  // Build HTML formatted for Microsoft Word / LibreOffice (.doc format with Word XML header)
  const docHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 20mm 20mm 20mm 25mm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 13pt;
    line-height: 1.35;
    color: #000;
  }
  table.header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18pt;
  }
  table.header-table td {
    vertical-align: top;
    padding: 0;
  }
  .unit-header {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  .unit-sub {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    text-decoration: underline;
  }
  .national-header {
    text-align: center;
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  .motto {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
  }
  .doc-date {
    text-align: right;
    font-style: italic;
    font-size: 12pt;
    margin-top: 6pt;
  }
  .main-title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 18pt 0 6pt 0;
  }
  .sub-title {
    text-align: center;
    font-size: 13pt;
    font-weight: bold;
    margin-bottom: 14pt;
  }
  .sapo-box {
    font-style: italic;
    font-weight: bold;
    text-align: justify;
    margin: 10pt 0;
    text-indent: 1cm;
  }
  .body-text {
    text-align: justify;
    text-indent: 1cm;
    margin: 8pt 0;
  }
  .rec-box {
    border: 1pt solid #333;
    padding: 8pt;
    background-color: #f9f9f9;
    margin: 12pt 0;
  }
  .table-data {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 12pt;
  }
  .table-data th, .table-data td {
    border: 1pt solid #000;
    padding: 5pt;
    text-align: left;
  }
  .table-data th {
    background-color: #eee;
    text-align: center;
  }
  table.sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 24pt;
  }
  table.sign-table td {
    vertical-align: top;
    padding: 0;
  }
  .recipients {
    font-size: 10pt;
    font-style: italic;
  }
  .sign-title {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
  }
</style>
</head>
<body>

<!-- HEADER BỘ CÔNG AN / QUỐC HIỆU -->
<table class="header-table">
  <tr>
    <td style="width: 45%;">
      <div class="unit-header">${parentUnit}</div>
      <div class="unit-sub">${department}</div>
      <div style="text-align: center; font-size: 11pt; margin-top: 4pt;">Số: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/BC-PC08</div>
    </td>
    <td style="width: 55%;">
      <div class="national-header">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
      <div class="doc-date">${location}, ngày ${day < 10 ? '0' + day : day} tháng ${month < 10 ? '0' + month : month} năm ${year}</div>
    </td>
  </tr>
</table>

<!-- TIÊU ĐỀ BÁO CÁO -->
<div class="main-title">BÁO CÁO TIN BÀI TUYÊN TRUYỀN TRẬT TỰ, AN TOÀN GIAO THÔNG</div>
<div class="sub-title">"${title}"</div>

<!-- KÍNH GỬI -->
<p style="text-align: center; font-weight: bold; margin-bottom: 12pt;">
  Kính gửi: Ban Giám đốc Công an tỉnh Vĩnh Long (để báo cáo)<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ban Chỉ huy Phòng Cảnh sát giao thông (PC08)
</p>

<!-- ĐOẠN MỞ ĐẦU (SAPO) -->
<div class="sapo-box">
  ${sapo}
</div>

<!-- THÂN BÀI NỘI DUNG -->
${body.split('\n\n').map(para => `<p class="body-text">${para.replace(/\n/g, '<br/>')}</p>`).join('')}

<!-- BẢNG TỔNG HỢP SỐ LIỆU NGUỒN CÔNG TÁC -->
<div style="font-weight: bold; margin-top: 14pt; text-decoration: underline;">BẢNG SỐ LIỆU NGHIỆP VỤ & KẾT QUẢ TTKS:</div>
<table class="table-data">
  <tr>
    <th>Nội dung chỉ tiêu</th>
    <th>Số liệu thực hiện</th>
    <th>Ghi chú / Căn cứ pháp lý</th>
  </tr>
  <tr>
    <td>Thời gian & Địa bàn thực hiện</td>
    <td>${src.date} ${src.time ? `(${src.time})` : ''}</td>
    <td>${src.route || src.location || 'Địa bàn phụ trách'}</td>
  </tr>
  <tr>
    <td>Lực lượng & Quân số tham gia</td>
    <td>${src.officers_count || 0} lượt CBCS ${src.patrol_shifts ? `(${src.patrol_shifts} ca trực)` : ''}</td>
    <td>${src.forces_involved || 'Lực lượng CSGT'}</td>
  </tr>
  <tr>
    <td>Tổng số phương tiện kiểm tra</td>
    <td>${src.vehicles_inspected || 0} lượt phương tiện</td>
    <td>Ô tô, mô tô, xe tải các loại</td>
  </tr>
  <tr>
    <td>Tổng số trường hợp vi phạm</td>
    <td><strong>${src.violations_count || 0} trường hợp</strong></td>
    <td>Lập biên bản VPHC theo quy định</td>
  </tr>
  ${src.violations && src.violations.length > 0 ? src.violations.map(v => `
  <tr>
    <td style="padding-left: 15pt;">- ${v.violation_name}</td>
    <td>${v.count} trường hợp</td>
    <td>${v.legal_reference || 'NĐ 168/2024/NĐ-CP'} ${v.penalty ? `(Mức phạt: ${v.penalty})` : ''}</td>
  </tr>
  `).join('') : ''}
  <tr>
    <td>Tạm giữ phương tiện & GPLX</td>
    <td>${src.vehicles_seized || 0} xe / ${src.licenses_seized || 0} GPLX</td>
    <td>Tước/tạm giữ theo quy định</td>
  </tr>
</table>

<!-- KHUYẾN CÁO AN TOÀN -->
${rec ? `
<div class="rec-box">
  <div style="font-weight: bold; text-transform: uppercase; color: #003366; margin-bottom: 4pt;">
    ★ THÔNG ĐIỆP KHUYẾN CÁO CỦA LỰC LƯỢNG CẢNH SÁT GIAO THÔNG:
  </div>
  <div style="text-align: justify; font-style: italic;">
    "${rec}"
  </div>
</div>
` : ''}

${hashtags ? `<p style="font-size: 11pt; color: #555;"><strong>Thẻ mạng xã hội:</strong> ${hashtags}</p>` : ''}

<!-- CHỮ KÝ & NƠI NHẬN -->
<table class="sign-table">
  <tr>
    <td style="width: 50%;">
      <div class="recipients">
        <strong><em>Nơi nhận:</em></strong><br/>
        - Như Kính gửi;<br/>
        - Đội TTKS giao thông;<br/>
        - Trang TTĐT Công an tỉnh;<br/>
        - Lưu: VT, PC08.
      </div>
    </td>
    <td style="width: 50%;">
      <div class="sign-title">
        ${article.team_name ? article.team_name.toUpperCase() : 'TRƯỞNG PHÒNG'}<br/>
        <span style="font-weight: normal; font-size: 10pt;">(Ký, ghi rõ họ tên và đóng dấu)</span>
      </div>
      <div style="height: 60pt;"></div>
      <div style="text-align: center; font-weight: bold; font-size: 12pt;">
        ${article.author_name || 'Đồng chí Chỉ huy'}
      </div>
    </td>
  </tr>
</table>

</body>
</html>
`;

  // Download file as .doc
  const blob = new Blob(['﻿', docHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CSGT_VinhLong_BaiViet_${article.id || Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
