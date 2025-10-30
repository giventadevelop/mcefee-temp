'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaUpload, FaTimes, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import type { ExecutiveCommitteeTeamMemberDTO, ExecutiveCommitteeTeamMemberFormData } from '@/types/executiveCommitteeTeamMember';
import { createExecutiveCommitteeMember, updateExecutiveCommitteeMember, uploadTeamMemberProfileImage } from './ApiServerActions';
import DragDropImageUpload from '@/components/DragDropImageUpload';
import SuccessDialog from '@/components/SuccessDialog';
import ErrorDialog from '@/components/ErrorDialog';

interface ExecutiveCommitteeFormProps {
  member?: ExecutiveCommitteeTeamMemberDTO | null;
  onSuccess: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onCancel: () => void;
}

export default function ExecutiveCommitteeForm({
  member,
  onSuccess,
  onCancel,
}: ExecutiveCommitteeFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(member?.profileImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expertiseItems, setExpertiseItems] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExecutiveCommitteeTeamMemberFormData>({
    defaultValues: {
      firstName: member?.firstName || '',
      lastName: member?.lastName || '',
      title: member?.title || '',
      designation: member?.designation || '',
      bio: member?.bio || '',
      email: member?.email || '',
      expertise: [''],
      imageBackground: member?.imageBackground || '',
      imageStyle: member?.imageStyle || '',
      department: member?.department || '',
      joinDate: member?.joinDate ? member.joinDate.split('T')[0] : '',
      isActive: member?.isActive ?? true,
      linkedinUrl: member?.linkedinUrl || '',
      twitterUrl: member?.twitterUrl || '',
      priorityOrder: member?.priorityOrder || 0,
      websiteUrl: member?.websiteUrl || '',
    },
  });

  const watchedIsActive = watch('isActive');

  useEffect(() => {
    if (member) {
      setValue('firstName', member.firstName);
      setValue('lastName', member.lastName);
      setValue('title', member.title);
      setValue('designation', member.designation || '');
      setValue('bio', member.bio || '');
      setValue('email', member.email || '');
      // Handle expertise field - convert from JSON array or space-separated string to array
      let expertiseArray: string[] = [''];
      if (member.expertise) {
        if (Array.isArray(member.expertise)) {
          expertiseArray = member.expertise.length > 0 ? member.expertise : [''];
        } else if (typeof member.expertise === 'string' && member.expertise.startsWith('[')) {
          try {
            const parsed = JSON.parse(member.expertise);
            expertiseArray = Array.isArray(parsed) && parsed.length > 0 ? parsed : [''];
          } catch {
            expertiseArray = member.expertise.trim() ? [member.expertise] : [''];
          }
        } else if (member.expertise.trim()) {
          expertiseArray = member.expertise.split(/\s+/).filter(s => s.trim());
        }
      }
      setExpertiseItems(expertiseArray);
      setValue('expertise', expertiseArray);
      setValue('imageBackground', member.imageBackground || '');
      setValue('imageStyle', member.imageStyle || '');
      setValue('department', member.department || '');
      setValue('joinDate', member.joinDate ? member.joinDate.split('T')[0] : '');
      setValue('isActive', member.isActive ?? true);
      setValue('linkedinUrl', member.linkedinUrl || '');
      setValue('twitterUrl', member.twitterUrl || '');
      setValue('priorityOrder', member.priorityOrder || 0);
      setValue('websiteUrl', member.websiteUrl || '');
    }
  }, [member, setValue]);

  // Handle expertise items changes
  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertiseItems = [...expertiseItems];
    newExpertiseItems[index] = value;
    setExpertiseItems(newExpertiseItems);
    setValue('expertise', newExpertiseItems);
  };

  const addExpertiseItem = () => {
    const newExpertiseItems = [...expertiseItems, ''];
    setExpertiseItems(newExpertiseItems);
    setValue('expertise', newExpertiseItems);
  };

  const removeExpertiseItem = (index: number) => {
    if (expertiseItems.length > 1) {
      const newExpertiseItems = expertiseItems.filter((_, i) => i !== index);
      setExpertiseItems(newExpertiseItems);
      setValue('expertise', newExpertiseItems);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (memberId: number): Promise<string | null> => {
    if (!imageFile) return member?.profileImageUrl || null;

    try {
      // Use the actual upload API for team member profile images
      const imageUrl = await uploadTeamMemberProfileImage(memberId, imageFile);
      return imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ExecutiveCommitteeTeamMemberFormData) => {
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // Filter out empty expertise items and convert to JSON string for backend
      const filteredExpertise = data.expertise.filter(item => item.trim());
      const expertiseString = filteredExpertise.length > 0 ?
        JSON.stringify(filteredExpertise) : undefined;

      // Step 1: Save member data first (without image)
      const memberData = {
        ...data,
        profileImageUrl: member?.profileImageUrl || undefined, // Keep existing or undefined for new
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : undefined,
        expertise: expertiseString
      };

      let result: ExecutiveCommitteeTeamMemberDTO | null = null;

      if (member?.id) {
        // Update existing member
        result = await updateExecutiveCommitteeMember(member.id, memberData);
      } else {
        // Create new member
        result = await createExecutiveCommitteeMember(memberData);
      }

      if (!result) {
        throw new Error('Failed to save member');
      }

      // Step 2: Upload image if there's a new image file
      if (imageFile && result.id) {
        setUploadProgress(30);
        try {
          const imageUrl = await uploadImage(result.id);
          if (imageUrl) {
            // Update the member with the new image URL
            const updatedMemberData = {
              ...memberData,
              profileImageUrl: imageUrl
            };

            setUploadProgress(70);
            const updatedResult = await updateExecutiveCommitteeMember(result.id, updatedMemberData);
            if (updatedResult) {
              result = updatedResult;
            }
          }
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          // Don't fail the entire process if image upload fails
          setErrorMessage('Member saved successfully, but image upload failed. You can upload the image later.');
          setShowErrorDialog(true);
        }
      }

      setUploadProgress(100);

      // Show success message
      setSuccessMessage('Team member saved successfully!');
      setShowSuccessDialog(true);

      // Call success handler
      onSuccess(result);

    } catch (error) {
      console.error('Form submission failed:', error);
      setErrorMessage(`Failed to save member: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowErrorDialog(true);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-blue-600 text-xs font-bold">ℹ</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Profile Image Guidelines</p>
            <p className="text-blue-700">
              Profile size or dimensions image guidelines are given in the parent page.
              Please refer to the parent page for the same.
            </p>
          </div>
        </div>
      </div>

      {/* Drag and Drop Image Upload */}
      <DragDropImageUpload
        onFileSelect={handleImageSelect}
        onFileRemove={handleImageRemove}
        selectedFile={imageFile}
        previewUrl={imagePreview}
        isUploading={isSubmitting && uploadProgress > 0}
        uploadProgress={uploadProgress}
        maxSize={10}
      />

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">First Name *</label>
          <input
            type="text"
            {...register('firstName', { required: 'First name is required' })}
            className={`w-full border rounded p-2 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.firstName && (
            <div className="text-red-500 text-sm mt-1">{errors.firstName.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Last Name *</label>
          <input
            type="text"
            {...register('lastName', { required: 'Last name is required' })}
            className={`w-full border rounded p-2 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.lastName && (
            <div className="text-red-500 text-sm mt-1">{errors.lastName.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Title *</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className={`w-full border rounded p-2 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.title && (
            <div className="text-red-500 text-sm mt-1">{errors.title.message}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Designation</label>
          <input
            type="text"
            {...register('designation')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Department</label>
          <input
            type="text"
            {...register('department')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Join Date</label>
          <input
            type="date"
            {...register('joinDate')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Priority Order</label>
          <input
            type="number"
            {...register('priorityOrder', { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bio and Expertise */}
      <div>
        <label className="block font-medium">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Brief biography of the team member..."
        />
      </div>

      <div>
        <label className="block font-medium">Expertise</label>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">
            Add expertise areas one by one. Examples: Leadership, Strategic Planning, Finance, Marketing, Team Building
          </p>
          {expertiseItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleExpertiseChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Leadership"
              />
              {expertiseItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExpertiseItem(index)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove expertise item"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExpertiseItem}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-md transition-colors"
            title="Add expertise item"
          >
            <FaPlus className="w-4 h-4" />
            Add Expertise
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Each expertise area will be stored as a separate item in the system.
        </p>
      </div>

      {/* Image Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Image Background</label>
          <input
            type="text"
            {...register('imageBackground')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., teal, blue, gradient"
          />
        </div>

        <div>
          <label className="block font-medium">Image Style</label>
          <input
            type="text"
            {...register('imageStyle')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., modern, classic, corporate"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium">LinkedIn URL</label>
          <input
            type="url"
            {...register('linkedinUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div>
          <label className="block font-medium">Twitter URL</label>
          <input
            type="url"
            {...register('twitterUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://twitter.com/..."
          />
        </div>

        <div>
          <label className="block font-medium">Website URL</label>
          <input
            type="url"
            {...register('websiteUrl')}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active member
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {member ? 'Update' : 'Create'} Member
            </>
          )}
        </button>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success"
        message={successMessage}
        showRefreshButton={false}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        message={errorMessage}
      />
    </form>
  );
}
