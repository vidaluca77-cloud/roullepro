'use client';

import Link from 'next/link';

export function LoginInvite({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
      {label}{' '}
      <Link href="/auth/login" className="font-medium underline">
        Se connecter
      </Link>
      .
    </div>
  );
}

export function ClaimInvite() {
  return (
    <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
      Pour participer au forum, vous devez d&apos;abord revendiquer et faire vérifier
      votre fiche professionnelle.{' '}
      <Link href="/transport-medical/pro" className="font-medium underline">
        Revendiquer ma fiche
      </Link>
      .
    </div>
  );
}
