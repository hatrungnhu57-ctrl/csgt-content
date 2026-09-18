'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { SourceData, ViolationEntry } from '@/lib/store/types';

interface ArticleDataFormProps {
  sourceData: SourceData;
  onChange: (data: SourceData) => void;
  articleType: string;
}

export const ArticleDataForm: React.FC<ArticleDataFormProps> = ({
  sourceData,
  onChange,
  articleType,
}) => {
  const updateField = (field: keyof SourceData, value: any) => {
    onChange({ ...sourceData, [field]: value });
  };

  const handleAddViolation = () => {
    const newViolation: ViolationEntry = {
      id: `v-${Date.now()}`,
      violation_name: '',
      count: 1,
      legal_reference: '',
      penalty: '',
      verified: false,
    };
    const current = sourceData.violations || [];
    updateField('violations', [...current, newViolation]);
  };

  const handleUpdateViolation = (index: number, field: keyof ViolationEntry, val: any) => {
    const list = [...(sourceData.violations || [])];
    list[index] = { ...list[index], [field]: val };
    updateField('violations', list);
  };

  const handleRemoveViolation = (index: number) => {
    const list = [...(sourceData.violations || [])];
    list.splice(index, 1);
    updateField('violations', list);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">2</span>
          BƯỚC 2: NHẬP DỮ LIỆU NGHIỆP VỤ (SOURCE DATA)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Nhập các trường thông tin có thực. Chỉ nhập những gì đã được ghi nhận. Không bắt buộc điền các ô không liên quan.
        </p>
      </div>

      {/* A. THÔNG TIN CHÍNH (Section IX.A) */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Building2 className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase text-slate-200">A. Thông tin chính của sự việc / ca trực</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Ngày thực hiện <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={sourceData.date || ''}
              onChange={e => updateField('date', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Thời gian / Khung giờ
            </label>
            <input
              type="text"
              placeholder="VD: 19h00 - 23h30 hoặc Sáng"
              value={sourceData.time || ''}
              onChange={e => updateField('time', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              Đơn vị thực hiện <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Đội CSGT-TT Công an huyện Trà Cú"
              value={sourceData.unit_name || ''}
              onChange={e => updateField('unit_name', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Tuyến đường / Địa điểm cụ thể
            </label>
            <input
              type="text"
              placeholder="VD: Km 42+500 Quốc lộ 53 (đoạn qua thị trấn Trà Cú)"
              value={sourceData.route || sourceData.location || ''}
              onChange={e => updateField('route', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Lực lượng phối hợp (nếu có)
            </label>
            <input
              type="text"
              placeholder="VD: Phối hợp Công an xã, Cảnh sát cơ động..."
              value={sourceData.forces_involved || ''}
              onChange={e => updateField('forces_involved', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Nội dung / Hoạt động chính đã thực hiện <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            placeholder="VD: Tổ chức cắm chốt kết hợp tuần tra kiểm soát lưu động, tập trung xử lý người điều khiển phương tiện vi phạm nồng độ cồn..."
            value={sourceData.actions_taken || sourceData.main_event || ''}
            onChange={e => updateField('actions_taken', e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* B. SỐ LIỆU ĐỊNH LƯỢNG (Section IX.B) */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase text-slate-200">B. Số liệu công tác & kết quả xử lý</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Số ca công tác</label>
            <input
              type="number"
              min={0}
              value={sourceData.patrol_shifts || ''}
              onChange={e => updateField('patrol_shifts', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Lượt CBCS</label>
            <input
              type="number"
              min={0}
              value={sourceData.officers_count || ''}
              onChange={e => updateField('officers_count', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Phương tiện kiểm tra</label>
            <input
              type="number"
              min={0}
              value={sourceData.vehicles_inspected || ''}
              onChange={e => updateField('vehicles_inspected', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-bold text-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Số vụ vi phạm</label>
            <input
              type="number"
              min={0}
              value={sourceData.violations_count || ''}
              onChange={e => updateField('violations_count', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-bold text-rose-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Ô tô vi phạm</label>
            <input
              type="number"
              min={0}
              value={sourceData.car_count || ''}
              onChange={e => updateField('car_count', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Mô tô vi phạm</label>
            <input
              type="number"
              min={0}
              value={sourceData.motorcycle_count || ''}
              onChange={e => updateField('motorcycle_count', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Tạm giữ phương tiện</label>
            <input
              type="number"
              min={0}
              value={sourceData.vehicles_seized || ''}
              onChange={e => updateField('vehicles_seized', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Tước/giữ GPLX, giấy tờ</label>
            <input
              type="number"
              min={0}
              value={sourceData.licenses_seized || ''}
              onChange={e => updateField('licenses_seized', e.target.value ? parseInt(e.target.value, 10) : undefined)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-400">Số tiền xử phạt (nếu có)</label>
            <input
              type="text"
              placeholder="VD: 35.000.000 đồng"
              value={sourceData.fines_amount || ''}
              onChange={e => updateField('fines_amount', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-medium text-slate-400">Kết quả hỗ trợ nhân dân</label>
            <input
              type="text"
              placeholder="VD: Giúp đỡ 02 trường hợp lỡ đường về nhà an toàn"
              value={sourceData.citizen_support_result || ''}
              onChange={e => updateField('citizen_support_result', e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* C. HÀNH VI VI PHẠM & CĂN CỨ PHÁP LÝ (Section IX.C & XVIII) */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase text-slate-200">C. Chi tiết hành vi vi phạm & Xác minh căn cứ pháp lý</h3>
          </div>
          <button
            type="button"
            onClick={handleAddViolation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Thêm hành vi
          </button>
        </div>

        <div className="space-y-3">
          {(!sourceData.violations || sourceData.violations.length === 0) ? (
            <div className="text-center py-4 text-slate-500 text-xs">
              Chưa nhập hành vi vi phạm cụ thể. Bấm <strong>+ Thêm hành vi</strong> nếu cần chi tiết hóa các lỗi.
            </div>
          ) : (
            sourceData.violations.map((viol, idx) => (
              <div
                key={viol.id || idx}
                className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Tên hành vi vi phạm</label>
                    <input
                      type="text"
                      placeholder="VD: Vi phạm nồng độ cồn chưa vượt quá 0.25 miligam/1 lít khí thở"
                      value={viol.violation_name}
                      onChange={e => handleUpdateViolation(idx, 'violation_name', e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Số vụ</label>
                    <input
                      type="number"
                      min={1}
                      value={viol.count}
                      onChange={e => handleUpdateViolation(idx, 'count', parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-400">Căn cứ pháp lý (Điều/Nghị định)</label>
                    </div>
                    <input
                      type="text"
                      placeholder="VD: NĐ 168/2024/NĐ-CP hoặc NĐ 238/2026/NĐ-CP"
                      value={viol.legal_reference || ''}
                      onChange={e => handleUpdateViolation(idx, 'legal_reference', e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none font-mono text-[11px]"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateViolation(idx, 'legal_reference', 'Nghị định 168/2024/NĐ-CP')}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 hover:bg-blue-900 font-mono"
                      >
                        + NĐ 168/2024
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateViolation(idx, 'legal_reference', 'Nghị định 238/2026/NĐ-CP')}
                        className="text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 font-mono"
                      >
                        + NĐ 238/2026
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-end justify-between gap-2 pt-4 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateViolation(idx, 'verified', !viol.verified)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                        viol.verified
                          ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                          : 'bg-amber-950/80 border-amber-600 text-amber-300'
                      }`}
                      title={viol.verified ? 'Đã xác minh chính xác' : 'Bấm để xác nhận VERIFIED'}
                    >
                      {viol.verified ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          VERIFIED
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                          NOT VERIFIED
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveViolation(idx)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-red-300"
                      title="Xóa dòng"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {!viol.verified && viol.legal_reference && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 pl-1">
                    ⚠️ Căn cứ pháp luật chưa được đánh dấu VERIFIED. Hệ thống sẽ không đưa vào bài viết để tránh sai lệch.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* D. ĐIỀU KIỆN TNGT ĐẶC THÙ (Section XIX) */}
      {articleType === 'tngt' && (
        <div className="rounded-xl border border-red-800/80 bg-red-950/20 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
            <AlertTriangle className="h-4 w-4" />
            <span>NGUYÊN TẮC NGHIỆM NGẶT ĐỐI VỚI BÀI TAI NẠN GIAO THÔNG (MỤC XIX)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tuyệt đối không tự suy đoán lỗi, nguyên nhân hoặc quy kết trách nhiệm pháp lý khi chưa có kết luận của cơ quan điều tra.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ghi chú tình trạng điều tra nguyên nhân:</label>
            <input
              type="text"
              placeholder="VD: Nguyên nhân vụ tai nạn đang được các cơ quan chức năng phối hợp điều tra, làm rõ."
              value={sourceData.accident_cause_note || 'Nguyên nhân vụ việc đang được cơ quan công an điều tra làm rõ theo quy định.'}
              onChange={e => updateField('accident_cause_note', e.target.value)}
              className="w-full rounded-lg border border-red-900/60 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* E. KHUYẾN CÁO & MONG MUỐN */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-5 space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          Khuyến cáo tuyên truyền mong muốn người dân thực hiện (Tùy chọn):
        </label>
        <textarea
          rows={2}
          placeholder="VD: Khuyến cáo người dân khi qua ngã tư cần giảm tốc độ, chú ý quan sát và tuân thủ hiệu lệnh của đèn tín hiệu giao thông..."
          value={sourceData.target_recommendation || ''}
          onChange={e => updateField('target_recommendation', e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
