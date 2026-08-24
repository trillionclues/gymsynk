'use client';

import { useState } from 'react';
import { MemberPageHero } from './member-page-hero';
import { MemberListPanel } from './member-list-panel';
import { MemberProfileDrawer } from './member-profile-drawer';
import { MemberRegistrationWizard } from './member-registration-wizard';
import { useMemberDirectory } from '@/hooks/use-member-directory';

export function MemberPage() {
  const directory = useMemberDirectory();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up">
      <MemberPageHero onOpenRegister={() => setIsRegisterOpen(true)} />
      <div className="w-full">
        <MemberListPanel
          members={directory.members}
          loading={directory.loading}
          refreshing={directory.refreshing}
          search={directory.search}
          onSearchChange={(value) => directory.setSearch(value)}
          onRefresh={directory.reload}
          onOpenMember={directory.openMember}
          onPageChange={directory.setPage}
          page={directory.page}
          totalPages={directory.meta.totalPages}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />
      </div>

      <MemberRegistrationWizard
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => directory.reload()}
      />

      <MemberProfileDrawer
        profile={directory.selectedMember}
        loading={directory.selectedLoading}
        onClose={directory.closeMember}
      />
    </div>
  );
}
