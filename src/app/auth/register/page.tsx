'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Truck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ email:'', password:'', nom:'', prenom:'', telephone:'', entreprise:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, [e.target.name]: e.target.value});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (authErr) { setError(authErr.message); setLoading(false); return; }
    if (data.user) {
      // Le profil est créé automatiquement par le trigger. On met à jour avec les infos supplémentaires.
      await supabase.from('profiles').update({
        full_name: `${form.prenom} ${form.nom}`.trim(),
        phone: form.telephone,
        entreprise: form.entreprise
      }).eq('id', data.user.id);
      setSuccess(true); 
      setLoading(false);
    }
  };
