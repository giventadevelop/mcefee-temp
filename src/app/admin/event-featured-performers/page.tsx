'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import AdminNavigation from '@/components/AdminNavigation';
import type { EventFeaturedPerformersDTO, EventDetailsDTO } from '@/types';
import {
  fetchEventFeaturedPerformersServer,
  createEventFeaturedPerformerServer,
  updateEventFeaturedPerformerServer,
  deleteEventFeaturedPerformerServer,
} from './ApiServerActions';

export default function EventFeaturedPerformersPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [performers, setPerformers] = useState<EventFeaturedPerformersDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<EventFeaturedPerformersDTO | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EventFeaturedPerformersDTO>>({
    name: '',
    stageName: '',
    role: '',
    bio: '',
    performanceDescription: '',
    socialMediaLinks: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    performanceOrder: 0,
    isHeadliner: false,
    performanceDuration: 0,
    specialRequirements: '',
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (userId) {
      loadPerformers();
    }
  }, [userId]);

  const loadPerformers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEventFeaturedPerformersServer();
      setPerformers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load performers');
      showError('Error', err.message || 'Failed to load performers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const newPerformer = await createEventFeaturedPerformerServer(formData as any);
      setPerformers(prev => [...prev, newPerformer]);
      setIsCreateModalOpen(false);
      resetForm();
      showSuccess('Success', 'Performer created successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create performer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPerformer) return;

    try {
      setLoading(true);
      const updatedPerformer = await updateEventFeaturedPerformerServer(selectedPerformer.id!, formData);
      setPerformers(prev => prev.map(p => p.id === selectedPerformer.id ? updatedPerformer : p));
      setIsEditModalOpen(false);
      setSelectedPerformer(null);
      resetForm();
      showSuccess('Success', 'Performer updated successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to update performer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPerformer) return;

    try {
      setLoading(true);
      await deleteEventFeaturedPerformerServer(selectedPerformer.id!);
      setPerformers(prev => prev.filter(p => p.id !== selectedPerformer.id));
      setIsDeleteModalOpen(false);
      setSelectedPerformer(null);
      showSuccess('Success', 'Performer deleted successfully');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to delete performer');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stageName: '',
      role: '',
      bio: '',
      performanceDescription: '',
      socialMediaLinks: '',
      website: '',
      contactEmail: '',
      contactPhone: '',
      performanceOrder: 0,
      isHeadliner: false,
      performanceDuration: 0,
      specialRequirements: '',
    });
  };

  const openEditModal = (performer: EventFeaturedPerformersDTO) => {
    setSelectedPerformer(performer);
    setFormData(performer);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (performer: EventFeaturedPerformersDTO) => {
    setSelectedPerformer(performer);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);

    const sorted = [...performers].sort((a, b) => {
      const aVal = a[key as keyof EventFeaturedPerformersDTO];
      const bVal = b[key as keyof EventFeaturedPerformersDTO];

      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setPerformers(sorted);
  };

  const filteredPerformers = performers.filter(performer =>
    performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.stageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    performer.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<EventFeaturedPerformersDTO>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'stageName',
      label: 'Stage Name',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'isHeadliner',
      label: 'Headliner',
      sortable: true,
      render: (value) => value ? 'Yes' : 'No'
    },
    {
      key: 'performanceOrder',
      label: 'Order',
      sortable: true,
      render: (value) => value || 0
    },
    {
      key: 'contactEmail',
      label: 'Email',
      render: (value) => value || '-'
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Featured Performers</h1>
      <AdminNavigation />

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search performers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-bold flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <FaPlus />
            Add Performer
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        data={filteredPerformers}
        columns={columns}
        loading={loading}
        onSort={handleSort}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage="No performers found"
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Performer"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPerformer(null);
          resetForm();
        }}
        title="Edit Featured Performer"
        size="lg"
      >
        <PerformerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Performer"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPerformer(null);
        }}
        onConfirm={handleDelete}
        title="Delete Performer"
        message={`Are you sure you want to delete "${selectedPerformer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div key={toast.id} className="bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{toast.title}</p>
                  {toast.message && <p className="text-sm text-gray-600">{toast.message}</p>}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Performer Form Component
interface PerformerFormProps {
  formData: Partial<EventFeaturedPerformersDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventFeaturedPerformersDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
}

function PerformerForm({ formData, setFormData, onSubmit, loading, submitText }: PerformerFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stage Name
          </label>
          <input
            type="text"
            name="stageName"
            value={formData.stageName || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Order
          </label>
          <input
            type="number"
            name="performanceOrder"
            value={formData.performanceOrder || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Performance Duration (minutes)
          </label>
          <input
            type="number"
            name="performanceDuration"
            value={formData.performanceDuration || 0}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isHeadliner"
            checked={formData.isHeadliner || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Is Headliner
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Performance Description
        </label>
        <textarea
          name="performanceDescription"
          value={formData.performanceDescription || ''}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          name="website"
          value={formData.website || ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Social Media Links
        </label>
        <textarea
          name="socialMediaLinks"
          value={formData.socialMediaLinks || ''}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter social media links separated by commas"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requirements
        </label>
        <textarea
          name="specialRequirements"
          value={formData.specialRequirements || ''}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}
