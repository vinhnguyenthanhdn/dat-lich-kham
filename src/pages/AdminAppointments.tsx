import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllAppointments,
  updateAppointmentStatus,
  updateAppointmentNote,
  updateAppointmentInfo,
  deleteAppointment,
  type AppointmentRow,
} from '../lib/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [selectedPatient, setSelectedPatient] = useState<AppointmentRow | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editPatientInfo, setEditPatientInfo] = useState({
    patient_name: '',
    patient_dob: '',
    parent_name: '',
    patient_address: '',
    patient_phone: '',
  });
  const pageSize = 20;

  useEffect(() => {
    loadAppointments();
  }, [currentPage, searchTerm, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const { data, count } = await getAllAppointments(
        pageSize,
        offset,
        searchTerm || undefined,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setAppointments(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
      return;
    }

    try {
      await deleteAppointment(id);
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Có lỗi khi xóa lịch hẹn');
    }
  };

  const handleEditNoteClick = () => {
    setEditNoteText(selectedPatient?.note || '');
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    if (!selectedPatient?.id) return;

    try {
      await updateAppointmentNote(selectedPatient.id, editNoteText);
      // Update the selectedPatient with new note
      setSelectedPatient({ ...selectedPatient, note: editNoteText });
      setIsEditingNote(false);
      // Reload to update the list
      loadAppointments();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Có lỗi khi lưu ghi chú');
    }
  };

  const handleCancelEditNote = () => {
    setIsEditingNote(false);
    setEditNoteText('');
  };

  const handleEditInfoClick = () => {
    if (selectedPatient) {
      setEditPatientInfo({
        patient_name: selectedPatient.patient_name,
        patient_dob: selectedPatient.patient_dob,
        parent_name: selectedPatient.parent_name || '',
        patient_address: selectedPatient.patient_address || '',
        patient_phone: selectedPatient.patient_phone,
      });
      setIsEditingInfo(true);
    }
  };

  const handleSavePatientInfo = async () => {
    if (!selectedPatient?.id) return;

    try {
      await updateAppointmentInfo(selectedPatient.id, editPatientInfo);
      // Update selectedPatient with new info
      setSelectedPatient({ ...selectedPatient, ...editPatientInfo });
      setIsEditingInfo(false);
      // Reload to update the list
      loadAppointments();
    } catch (error) {
      console.error('Error saving patient info:', error);
      alert('Có lỗi khi lưu thông tin bệnh nhân');
    }
  };

  const handleCancelEditInfo = () => {
    setIsEditingInfo(false);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    setIsEditingNote(false);
    setEditNoteText('');
    setIsEditingInfo(false);
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const exportData = appointments.map((apt) => ({
      'ID': apt.id,
      'Tên bệnh nhân': apt.patient_name,
      'Ngày sinh': apt.patient_dob,
      'Tên phụ huynh': apt.parent_name || '',
      'Số điện thoại': apt.patient_phone,
      'Địa chỉ': apt.patient_address || '',
      'Lý do khám': apt.reason,
      'Ngày giờ khám': formatDateTime(apt.appointment_date),
      'Trạng thái': apt.status === 'confirmed' ? 'Đã xác nhận' : apt.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận',
      'Ghi chú': apt.note || '',
      'Ngày đăng ký': apt.created_at ? formatDateTime(apt.created_at) : '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // ID
      { wch: 20 }, // Tên bệnh nhân
      { wch: 12 }, // Ngày sinh
      { wch: 20 }, // Tên phụ huynh
      { wch: 15 }, // Số điện thoại
      { wch: 30 }, // Địa chỉ
      { wch: 25 }, // Lý do khám
      { wch: 18 }, // Ngày giờ khám
      { wch: 15 }, // Trạng thái
      { wch: 40 }, // Ghi chú
      { wch: 18 }, // Ngày đăng ký
    ];

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách bệnh nhân');

    // Generate filename with current date
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `danh-sach-benh-nhan-${today}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Imported data:', jsonData);
        alert(`Đã đọc ${jsonData.length} bản ghi từ file Excel. Tính năng import sẽ được hoàn thiện sau.`);

        // TODO: Implement actual import to database
        // This would require validation and calling insertAppointment for each row

      } catch (error) {
        console.error('Error importing Excel:', error);
        alert('Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsBinaryString(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Danh sách bệnh nhân
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Import/Export Buttons */}
        <div className="mb-4 flex gap-3 justify-end">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Excel
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export Excel
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tên bệnh nhân, phụ huynh, số điện thoại..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Tổng số: <span className="font-semibold">{totalCount}</span> lịch hẹn
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-gray-600">Không tìm thấy lịch hẹn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bệnh nhân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày sinh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lịch hẹn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi chú
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{apt.patient_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{apt.patient_dob}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateTime(apt.appointment_date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={apt.reason}>
                          {apt.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={apt.status || 'pending'}
                          onChange={(e) => handleStatusChange(apt.id!, e.target.value as any)}
                          className={`text-sm rounded-full px-3 py-1 font-semibold border-0 focus:ring-2 ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          <option value="pending">Chờ</option>
                          <option value="confirmed">Xác nhận</option>
                          <option value="cancelled">Hủy</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {apt.note ? (
                            <div className="text-sm text-gray-700">
                              {apt.note.length > 100 ? (
                                <p className="line-clamp-2" title={apt.note}>
                                  {apt.note.substring(0, 100)}...
                                </p>
                              ) : (
                                <p>{apt.note}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Chưa có ghi chú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedPatient(apt)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleDelete(apt.id!)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Thông tin chi tiết bệnh nhân</h2>
                  <p className="text-blue-100 text-sm">ID: {selectedPatient.id}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Patient Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Thông tin bệnh nhân
                  </h3>
                  {!isEditingInfo && (
                    <button
                      onClick={handleEditInfoClick}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa
                    </button>
                  )}
                </div>
                {isEditingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1">Tên bệnh nhân</label>
                        <input
                          type="text"
                          value={editPatientInfo.patient_name}
                          onChange={(e) => setEditPatientInfo({ ...editPatientInfo, patient_name: e.target.value })}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1">Ngày sinh (dd/mm/yyyy)</label>
                        <input
                          type="text"
                          value={editPatientInfo.patient_dob}
                          onChange={(e) => setEditPatientInfo({ ...editPatientInfo, patient_dob: e.target.value })}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="dd/mm/yyyy"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1">Tên phụ huynh</label>
                        <input
                          type="text"
                          value={editPatientInfo.parent_name}
                          onChange={(e) => setEditPatientInfo({ ...editPatientInfo, parent_name: e.target.value })}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={editPatientInfo.patient_phone}
                          onChange={(e) => setEditPatientInfo({ ...editPatientInfo, patient_phone: e.target.value })}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-gray-600 block mb-1">Địa chỉ</label>
                        <input
                          type="text"
                          value={editPatientInfo.patient_address}
                          onChange={(e) => setEditPatientInfo({ ...editPatientInfo, patient_address: e.target.value })}
                          className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={handleCancelEditInfo}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSavePatientInfo}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Lưu thông tin
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Tên bệnh nhân</label>
                      <p className="text-base text-gray-900 mt-1">{selectedPatient.patient_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Ngày sinh</label>
                      <p className="text-base text-gray-900 mt-1">{selectedPatient.patient_dob}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Tên phụ huynh</label>
                      <p className="text-base text-gray-900 mt-1">{selectedPatient.parent_name || <span className="text-gray-400 italic">Không có</span>}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Số điện thoại</label>
                      <p className="text-base text-gray-900 mt-1">
                        <a href={`tel:${selectedPatient.patient_phone}`} className="text-blue-600 hover:underline">
                          {selectedPatient.patient_phone}
                        </a>
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Địa chỉ</label>
                      <p className="text-base text-gray-900 mt-1">{selectedPatient.patient_address || <span className="text-gray-400 italic">Không có</span>}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Appointment Information */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Thông tin lịch hẹn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Ngày giờ khám</label>
                    <p className="text-base text-gray-900 mt-1 font-semibold">
                      {formatDateTime(selectedPatient.appointment_date)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Trạng thái</label>
                    <p className="mt-1">
                      <span className={`inline-block text-sm rounded-full px-4 py-1 font-semibold ${
                        selectedPatient.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : selectedPatient.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedPatient.status === 'confirmed' ? 'Đã xác nhận' : selectedPatient.status === 'cancelled' ? 'Đã hủy' : 'Chờ xác nhận'}
                      </span>
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Lý do khám</label>
                    <p className="text-base text-gray-900 mt-1">{selectedPatient.reason}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Ngày đăng ký</label>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPatient.created_at ? formatDateTime(selectedPatient.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Notes */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Ghi chú của bác sĩ
                  </h3>
                  {!isEditingNote && (
                    <button
                      onClick={handleEditNoteClick}
                      className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {selectedPatient.note ? 'Chỉnh sửa' : 'Thêm ghi chú'}
                    </button>
                  )}
                </div>
                {isEditingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="w-full border-2 border-green-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Nhập ghi chú của bác sĩ..."
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={handleCancelEditNote}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Lưu ghi chú
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 min-h-[100px]">
                    {selectedPatient.note ? (
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{selectedPatient.note}</p>
                    ) : (
                      <p className="text-gray-400 italic">Chưa có ghi chú</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
