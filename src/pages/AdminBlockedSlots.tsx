import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot,
  updateBlockedSlot,
  type BlockedSlot,
} from '../lib/supabase';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminBlockedSlots() {
  const navigate = useNavigate();
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BlockedSlot | null>(null);
  const [formData, setFormData] = useState({
    blocked_date: '',
    blocked_time: '',
    reason: '',
  });

  useEffect(() => {
    loadBlockedSlots();
  }, []);

  const loadBlockedSlots = async () => {
    try {
      setLoading(true);
      const data = await getAllBlockedSlots();
      setBlockedSlots(data);
    } catch (error) {
      console.error('Error loading blocked slots:', error);
      alert('Có lỗi khi tải danh sách khung giờ bị khóa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!formData.blocked_date || !formData.blocked_time) {
      alert('Vui lòng chọn ngày và giờ');
      return;
    }

    try {
      await addBlockedSlot(formData);
      setShowAddModal(false);
      setFormData({ blocked_date: '', blocked_time: '', reason: '' });
      loadBlockedSlots();
    } catch (error) {
      console.error('Error adding blocked slot:', error);
      alert('Có lỗi khi thêm khung giờ bị khóa. Có thể khung giờ này đã tồn tại.');
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot?.id) return;

    try {
      await updateBlockedSlot(editingSlot.id, {
        blocked_date: formData.blocked_date,
        blocked_time: formData.blocked_time,
        reason: formData.reason,
      });
      setEditingSlot(null);
      setFormData({ blocked_date: '', blocked_time: '', reason: '' });
      loadBlockedSlots();
    } catch (error) {
      console.error('Error updating blocked slot:', error);
      alert('Có lỗi khi cập nhật khung giờ bị khóa');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khung giờ bị khóa này?')) {
      return;
    }

    try {
      await deleteBlockedSlot(id);
      loadBlockedSlots();
    } catch (error) {
      console.error('Error deleting blocked slot:', error);
      alert('Có lỗi khi xóa khung giờ bị khóa');
    }
  };

  const handleEditClick = (slot: BlockedSlot) => {
    setEditingSlot(slot);
    setFormData({
      blocked_date: slot.blocked_date,
      blocked_time: slot.blocked_time,
      reason: slot.reason || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setFormData({ blocked_date: '', blocked_time: '', reason: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString + 'T00:00:00'), 'dd/MM/yyyy (EEEE)', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Generate time slot options (same as booking form)
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let hour = 8; hour <= 19; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 19) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý khung giờ bị khóa
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ← Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/appointments')}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Danh sách BN
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
        {/* Add Button */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Quản lý các khung giờ không khả dụng cho bệnh nhân đặt lịch
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm khung giờ bị khóa
          </button>
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
          ) : blockedSlots.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-600">Chưa có khung giờ bị khóa nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blockedSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(slot.blocked_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{slot.blocked_time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {slot.reason || <span className="text-gray-400 italic">Không có lý do</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditClick(slot)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id!)}
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
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingSlot) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold">
                {editingSlot ? 'Chỉnh sửa khung giờ bị khóa' : 'Thêm khung giờ bị khóa'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.blocked_date}
                  onChange={(e) => setFormData({ ...formData, blocked_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giờ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.blocked_time}
                  onChange={(e) => setFormData({ ...formData, blocked_time: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn giờ --</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lý do (tùy chọn)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Ví dụ: Bác sĩ nghỉ phép, sự kiện đặc biệt..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    handleCancelEdit();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={editingSlot ? handleUpdateSlot : handleAddSlot}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {editingSlot ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
