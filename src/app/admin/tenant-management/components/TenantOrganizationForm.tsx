'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaBan, FaUpload, FaEye } from 'react-icons/fa';
import type { TenantOrganizationDTO, TenantOrganizationFormDTO } from '@/app/admin/tenant-management/types';

interface TenantOrganizationFormProps {
  initialData?: TenantOrganizationDTO;
  onSubmit: (data: TenantOrganizationFormDTO) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export default function TenantOrganizationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode
}: TenantOrganizationFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<TenantOrganizationFormDTO>({
    defaultValues: {
      tenantId: initialData?.tenantId || '',
      organizationName: initialData?.organizationName || '',
      domain: initialData?.domain || '',
      primaryColor: initialData?.primaryColor || '#3B82F6',
      secondaryColor: initialData?.secondaryColor || '#10B981',
      logoUrl: initialData?.logoUrl || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
      subscriptionPlan: initialData?.subscriptionPlan || '',
      subscriptionStatus: initialData?.subscriptionStatus || '',
      subscriptionStartDate: initialData?.subscriptionStartDate || '',
      subscriptionEndDate: initialData?.subscriptionEndDate || '',
      monthlyFeeUsd: initialData?.monthlyFeeUsd || 0,
      stripeCustomerId: initialData?.stripeCustomerId || '',
      isActive: initialData?.isActive ?? true
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // Set logo preview when initial data changes
  useEffect(() => {
    if (initialData?.logoUrl) {
      setLogoPreview(initialData.logoUrl);
    }
  }, [initialData]);

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onFormSubmit = async (data: TenantOrganizationFormDTO) => {
    try {
      // TODO: Handle logo file upload to storage service
      // For now, we'll just use the existing logoUrl or empty string
      const formData = {
        ...data,
        logoUrl: logoPreview || data.logoUrl || ''
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Color picker component
  const ColorPicker = ({
    name,
    label,
    value,
    onChange
  }: {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant ID *
              </label>
              <input
                type="text"
                {...register('tenantId', {
                  required: 'Tenant ID is required',
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Tenant ID can only contain letters, numbers, hyphens, and underscores'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="e.g., tenant_demo_001"
              />
              {errors.tenantId && (
                <p className="mt-1 text-sm text-red-600">{errors.tenantId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                {...register('organizationName', {
                  required: 'Organization name is required',
                  maxLength: {
                    value: 255,
                    message: 'Organization name must be less than 255 characters'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="e.g., Malayalees US Organization"
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                type="text"
                {...register('domain', {
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.?[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/,
                    message: 'Please enter a valid domain name'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="e.g., malayalees-us.org"
              />
              {errors.domain && (
                <p className="mt-1 text-sm text-red-600">{errors.domain.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                {...register('contactEmail', {
                  required: 'Contact email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="e.g., admin@malayalees-us.org"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                {...register('contactPhone', {
                  maxLength: {
                    value: 50,
                    message: 'Phone number must be less than 50 characters'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="e.g., +1 (555) 123-4567"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Branding</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker
              name="primaryColor"
              label="Primary Color"
              value={watchedValues.primaryColor || '#3B82F6'}
              onChange={(value) => setValue('primaryColor', value)}
            />

            <ColorPicker
              name="secondaryColor"
              label="Secondary Color"
              value={watchedValues.secondaryColor || '#10B981'}
              onChange={(value) => setValue('secondaryColor', value)}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
              >
                <FaUpload />
                Upload Logo
              </label>
              {logoPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain border border-gray-300 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFile(null);
                      setValue('logoUrl', '');
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 200x200px or larger. Supported formats: PNG, JPG, SVG
            </p>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Plan
              </label>
              <select
                {...register('subscriptionPlan')}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              >
                <option value="">Select Plan</option>
                <option value="BASIC">Basic</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <select
                {...register('subscriptionStatus')}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Start Date
              </label>
              <input
                type="date"
                {...register('subscriptionStartDate')}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription End Date
              </label>
              <input
                type="date"
                {...register('subscriptionEndDate')}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fee (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('monthlyFeeUsd', {
                  min: {
                    value: 0,
                    message: 'Monthly fee must be greater than or equal to 0'
                  }
                })}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="0.00"
              />
              {errors.monthlyFeeUsd && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyFeeUsd.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stripe Customer ID
              </label>
              <input
                type="text"
                {...register('stripeCustomerId')}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="cus_xxxxxxxxxxxxx"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="custom-checkbox"
            />
            <label className="ml-3 text-sm font-medium text-gray-700">
              Active Organization
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Inactive organizations cannot be used for new events or registrations
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaBan />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {isSubmitting || loading ? 'Saving...' : mode === 'create' ? 'Create Organization' : 'Update Organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
