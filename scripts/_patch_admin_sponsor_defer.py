"""Patch adwiise-agent-admin event-sponsors page for defer-upload create flow."""
from pathlib import Path

path = Path(r"f:\project_workspace\adwiise-agent-admin\src\app\admin\event-sponsors\page.tsx")
text = path.read_text(encoding="utf-8")

# imports
old_imp = """import SponsorImageUploadDialog from '@/components/sponsors/SponsorImageUploadDialog';
import SponsorMediaGallery from '@/components/sponsors/SponsorMediaGallery';
import type { EventSponsorsDTO } from '@/types';
import {
  fetchEventSponsorsServer,
  createEventSponsorServer,
  updateEventSponsorServer,
  deleteEventSponsorServer,
} from './ApiServerActions';"""

new_imp = """import SponsorImageUploadDialog from '@/components/sponsors/SponsorImageUploadDialog';
import SponsorImageUploadArea from '@/components/sponsors/SponsorImageUploadArea';
import SponsorMediaGallery from '@/components/sponsors/SponsorMediaGallery';
import type { EventSponsorsDTO } from '@/types';
import {
  fetchEventSponsorsServer,
  createEventSponsorServer,
  updateEventSponsorServer,
  deleteEventSponsorServer,
  uploadSponsorImageServer,
} from './ApiServerActions';"""

if old_imp not in text:
    raise SystemExit("imports block not found")
text = text.replace(old_imp, new_imp, 1)

# pending state
old_upload_state = """  // Upload dialog states
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [heroUploadOpen, setHeroUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);"""

new_upload_state = """  // Upload dialog states (edit mode — immediate upload)
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [heroUploadOpen, setHeroUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);

  // Pending images for create (defer-upload until sponsor exists)
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingHeroFile, setPendingHeroFile] = useState<File | null>(null);
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);"""

if old_upload_state not in text:
    raise SystemExit("upload state not found")
text = text.replace(old_upload_state, new_upload_state, 1)

# handleCreate success block
old_create = """      const newSponsor = await createEventSponsorServer(sponsorData, tenantId);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor created successfully. You can now upload images when editing the sponsor.' });
      // Reload sponsors to ensure fresh data
      await loadSponsors();"""

new_create = """      const newSponsor = await createEventSponsorServer(sponsorData, tenantId);
      const createdId = newSponsor?.id;

      const pendingUploads: Array<{ type: 'logo' | 'hero' | 'banner'; file: File }> = [];
      if (createdId && pendingLogoFile) pendingUploads.push({ type: 'logo', file: pendingLogoFile });
      if (createdId && pendingHeroFile) pendingUploads.push({ type: 'hero', file: pendingHeroFile });
      if (createdId && pendingBannerFile) pendingUploads.push({ type: 'banner', file: pendingBannerFile });

      let uploadedCount = 0;
      let uploadFailed = false;
      for (const item of pendingUploads) {
        try {
          await uploadSponsorImageServer(createdId!, 0, item.type, item.file, tenantId);
          uploadedCount += 1;
        } catch (uploadErr) {
          console.error(`[CreateSponsor] ${item.type} upload failed:`, uploadErr);
          uploadFailed = true;
        }
      }

      setIsCreateModalOpen(false);
      resetForm();
      setPendingLogoFile(null);
      setPendingHeroFile(null);
      setPendingBannerFile(null);

      if (pendingUploads.length === 0) {
        setToastMessage({ type: 'success', message: 'Sponsor created successfully' });
      } else if (!uploadFailed) {
        setToastMessage({
          type: 'success',
          message: `Sponsor created and ${uploadedCount} image${uploadedCount === 1 ? '' : 's'} uploaded`,
        });
      } else {
        setToastMessage({
          type: 'error',
          message:
            uploadedCount > 0
              ? `Sponsor created; ${uploadedCount} image(s) uploaded, some failed — edit the sponsor to retry.`
              : 'Sponsor created, but image upload failed. Edit the sponsor to upload images.',
        });
      }
      await loadSponsors();"""

if old_create not in text:
    raise SystemExit("handleCreate block not found")
text = text.replace(old_create, new_create, 1)

# blob URL omit in create payload
old_urls = """        logoUrl: formData.logoUrl?.trim() || undefined,
        heroImageUrl: formData.heroImageUrl?.trim() || undefined,
        bannerImageUrl: formData.bannerImageUrl?.trim() || undefined,"""

new_urls = """        logoUrl:
          formData.logoUrl?.trim() && !formData.logoUrl.startsWith('blob:')
            ? formData.logoUrl.trim()
            : undefined,
        heroImageUrl:
          formData.heroImageUrl?.trim() && !formData.heroImageUrl.startsWith('blob:')
            ? formData.heroImageUrl.trim()
            : undefined,
        bannerImageUrl:
          formData.bannerImageUrl?.trim() && !formData.bannerImageUrl.startsWith('blob:')
            ? formData.bannerImageUrl.trim()
            : undefined,"""

if old_urls not in text:
    raise SystemExit("logo urls block not found")
text = text.replace(old_urls, new_urls, 1)

# resetForm — add pending clears before closing of resetForm
# find tiktokUrl: '', then }; of setFormData in resetForm
marker = "      tiktokUrl: '',\n    });\n  };"
if marker not in text:
    # try without tiktok
    marker = "      instagramUrl: '',\n    });\n  };"
if "setPendingLogoFile(null)" not in text:
    text = text.replace(
        marker,
        marker.replace(
            "    });\n  };",
            "    });\n    setPendingLogoFile(null);\n    setPendingHeroFile(null);\n    setPendingBannerFile(null);\n  };",
        ),
        1,
    )

# create modal SponsorForm
old_create_form = """        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Sponsor"
          onLogoUploadClick={() => setLogoUploadOpen(true)}
          onHeroUploadClick={() => setHeroUploadOpen(true)}
          onBannerUploadClick={() => setBannerUploadOpen(true)}
        />"""

new_create_form = """        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Sponsor"
          deferImages
          onPendingLogoSelected={(file, preview) => {
            setPendingLogoFile(file);
            setFormData((prev) => ({ ...prev, logoUrl: preview }));
          }}
          onPendingLogoCleared={() => {
            setPendingLogoFile(null);
            setFormData((prev) => ({ ...prev, logoUrl: '' }));
          }}
          onPendingHeroSelected={(file, preview) => {
            setPendingHeroFile(file);
            setFormData((prev) => ({ ...prev, heroImageUrl: preview }));
          }}
          onPendingHeroCleared={() => {
            setPendingHeroFile(null);
            setFormData((prev) => ({ ...prev, heroImageUrl: '' }));
          }}
          onPendingBannerSelected={(file, preview) => {
            setPendingBannerFile(file);
            setFormData((prev) => ({ ...prev, bannerImageUrl: preview }));
          }}
          onPendingBannerCleared={() => {
            setPendingBannerFile(null);
            setFormData((prev) => ({ ...prev, bannerImageUrl: '' }));
          }}
        />"""

if old_create_form not in text:
    raise SystemExit("create SponsorForm not found")
text = text.replace(old_create_form, new_create_form, 1)

# SponsorForm props + function signature + image section — replace larger chunks
old_props = """interface SponsorFormProps {
  formData: Partial<EventSponsorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  onLogoUploadClick?: () => void;
  onHeroUploadClick?: () => void;
  onBannerUploadClick?: () => void;
}

function SponsorForm({ formData, setFormData, onSubmit, loading, submitText, onLogoUploadClick, onHeroUploadClick, onBannerUploadClick }: SponsorFormProps) {"""

new_props = """interface SponsorFormProps {
  formData: Partial<EventSponsorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  onLogoUploadClick?: () => void;
  onHeroUploadClick?: () => void;
  onBannerUploadClick?: () => void;
  deferImages?: boolean;
  onPendingLogoSelected?: (file: File, previewUrl: string) => void;
  onPendingLogoCleared?: () => void;
  onPendingHeroSelected?: (file: File, previewUrl: string) => void;
  onPendingHeroCleared?: () => void;
  onPendingBannerSelected?: (file: File, previewUrl: string) => void;
  onPendingBannerCleared?: () => void;
}

function SponsorForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  submitText,
  onLogoUploadClick,
  onHeroUploadClick,
  onBannerUploadClick,
  deferImages = false,
  onPendingLogoSelected,
  onPendingLogoCleared,
  onPendingHeroSelected,
  onPendingHeroCleared,
  onPendingBannerSelected,
  onPendingBannerCleared,
}: SponsorFormProps) {"""

if old_props not in text:
    raise SystemExit("SponsorForm props not found")
text = text.replace(old_props, new_props, 1)

old_can = """  // Note: ImageUpload requires eventId. For main sponsors page, we'll use a default eventId of 0
  // or only show image uploads after sponsor is created (when formData.id exists)
  // For now, we'll show image uploads only when editing (formData.id exists)
  const canUploadImages = !!formData.id;"""

new_can = """  const canUploadImages = !!formData.id;
  const showImageSection = canUploadImages || deferImages;"""

if old_can not in text:
    raise SystemExit("canUploadImages note not found")
text = text.replace(old_can, new_can, 1)

# Replace image section through note end
start = text.find("      {/* Image Upload Section - Only show when editing (sponsor ID exists) */}")
end = text.find("      {/* Media Gallery Section */}")
if start < 0 or end < 0:
    raise SystemExit(f"image section markers not found start={start} end={end}")

new_section = """      {/* Images — create: defer-upload pickers; edit: immediate upload buttons */}
      {showImageSection && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-heading font-medium text-foreground mb-4">
            {deferImages ? 'Images (optional)' : 'Images'}
          </h3>
          {deferImages ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SponsorImageUploadArea
                imageType="logo"
                deferUpload
                currentImageUrl={formData.logoUrl}
                disabled={loading}
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
                onFileSelected={onPendingLogoSelected}
                onFileCleared={onPendingLogoCleared}
              />
              <SponsorImageUploadArea
                imageType="hero"
                deferUpload
                currentImageUrl={formData.heroImageUrl}
                disabled={loading}
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, heroImageUrl: url }))}
                onFileSelected={onPendingHeroSelected}
                onFileCleared={onPendingHeroCleared}
              />
              <SponsorImageUploadArea
                imageType="banner"
                deferUpload
                currentImageUrl={formData.bannerImageUrl}
                disabled={loading}
                onUploadSuccess={(url) => setFormData((prev) => ({ ...prev, bannerImageUrl: url }))}
                onFileSelected={onPendingBannerSelected}
                onFileCleared={onPendingBannerCleared}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Logo Image</label>
                {formData.logoUrl && (
                  <div className="mb-2">
                    <img src={formData.logoUrl} alt="Logo" className="h-20 w-auto rounded border border-border" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLogoUploadClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                  disabled={loading || !formData.id}
                >
                  {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Hero Image</label>
                {formData.heroImageUrl && (
                  <div className="mb-2">
                    <img src={formData.heroImageUrl} alt="Hero" className="h-20 w-auto rounded border border-border" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onHeroUploadClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                  disabled={loading || !formData.id}
                >
                  {formData.heroImageUrl ? 'Change Hero Image' : 'Upload Hero Image'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Banner Image</label>
                {formData.bannerImageUrl && (
                  <div className="mb-2">
                    <img src={formData.bannerImageUrl} alt="Banner" className="h-20 w-auto rounded border border-border" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={onBannerUploadClick}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                  disabled={loading || !formData.id}
                >
                  {formData.bannerImageUrl ? 'Change Banner' : 'Upload Banner'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

"""

text = text[:start] + new_section + text[end:]

# local filter include searchText
old_filter = """    const matchesSearch = !searchTerm ||
      sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());"""

new_filter = """    const q = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      sponsor.name?.toLowerCase().includes(q) ||
      sponsor.companyName?.toLowerCase().includes(q) ||
      sponsor.type?.toLowerCase().includes(q) ||
      sponsor.description?.toLowerCase().includes(q) ||
      sponsor.tagline?.toLowerCase().includes(q) ||
      sponsor.searchText?.toLowerCase().includes(q) ||
      sponsor.ocrText?.toLowerCase().includes(q) ||
      sponsor.contactEmail?.toLowerCase().includes(q);"""

if old_filter in text:
    text = text.replace(old_filter, new_filter, 1)

path.write_text(text, encoding="utf-8")
print("OK patched", path)
