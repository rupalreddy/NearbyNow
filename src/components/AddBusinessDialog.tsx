import { useState } from 'react';
import { Plus, X, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { categoryInfo, type ServiceCategory } from '@/data/services';
import { toast } from 'sonner';

interface AddBusinessDialogProps {
  userLocation: { lat: number; lng: number } | null;
  onAdded: () => void;
}

const categories = Object.entries(categoryInfo) as [ServiceCategory, typeof categoryInfo[ServiceCategory]][];

const AddBusinessDialog = ({ userLocation, onAdded }: AddBusinessDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const [form, setForm] = useState({
    name: '',
    category: 'food' as ServiceCategory,
    description: '',
    address: '',
    phone: '',
    hours: '',
    lat: '',
    lng: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to add your business');
      return;
    }

    if (!form.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    const lat = useCurrentLocation && userLocation ? userLocation.lat : parseFloat(form.lat);
    const lng = useCurrentLocation && userLocation ? userLocation.lng : parseFloat(form.lng);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Valid location coordinates are required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('user_businesses').insert({
        user_id: user.id,
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        hours: form.hours.trim() || null,
        lat,
        lng,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });

      if (error) throw error;

      toast.success('Business submitted! It will appear after approval.');
      setForm({ name: '', category: 'food', description: '', address: '', phone: '', hours: '', lat: '', lng: '', tags: '' });
      setOpen(false);
      onAdded();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit business');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <Plus size={13} />
        Add Your Business
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-card-foreground">Add Your Business</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Business Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your business name"
              required
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ServiceCategory })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder="Describe your business..."
              maxLength={500}
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="123 Main St, City"
              maxLength={300}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Location *</label>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setUseCurrentLocation(!useCurrentLocation)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                  useCurrentLocation
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border'
                }`}
              >
                <MapPin size={12} />
                Use my current location
              </button>
            </div>
            {!useCurrentLocation && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Latitude"
                />
                <input
                  type="text"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Longitude"
                />
              </div>
            )}
          </div>

          {/* Phone & Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+1 555-123-4567"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Hours</label>
              <input
                type="text"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="9 AM – 6 PM"
                maxLength={50}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="WiFi, Parking, Delivery"
              maxLength={200}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? 'Submitting...' : 'Submit Business'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBusinessDialog;
