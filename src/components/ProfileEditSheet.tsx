import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import type { ProfileRow } from '@/types/database';

type ProfileEdits = Partial<Pick<ProfileRow, 'full_name' | 'bio' | 'instagram' | 'business'>>;

interface ProfileEditSheetProps {
  profile: ProfileRow | null;
  updateProfile: (patch: ProfileEdits) => Promise<{ error: string | null }>;
  onClose: () => void;
}

/** Editar nome/bio/Instagram/negócio do perfil da usuária logada. */
export function ProfileEditSheet({ profile, updateProfile, onClose }: ProfileEditSheetProps) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [instagram, setInstagram] = useState(profile?.instagram ?? '');
  const [business, setBusiness] = useState(profile?.business ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await updateProfile({
      full_name: fullName || null,
      bio: bio || null,
      instagram: instagram || null,
      business: business || null,
    });
    setSubmitting(false);
    if (result.error) setError(result.error);
    else onClose();
  }

  return (
    <EditSheet
      title="Editar perfil"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={submitting ? 'Salvando...' : 'Salvar'}
    >
      <label className="field">
        <span>Nome</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </label>
      <label className="field">
        <span>Bio</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
      </label>
      <label className="field">
        <span>Instagram</span>
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seu.perfil" />
      </label>
      <label className="field">
        <span>Negócio</span>
        <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="O que você empreende" />
      </label>
      {error && <p className="auth-error">{error}</p>}
    </EditSheet>
  );
}
