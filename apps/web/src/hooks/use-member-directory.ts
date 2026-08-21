'use client';

import { useEffect, useState } from 'react';
import { getMember, searchMembers, type MemberListItem, type MemberProfileResponse } from '@/services/member-service';

export function useMemberDirectory() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [meta, setMeta] = useState({ totalPages: 0, totalElements: 0, number: 0, first: true, last: true });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberProfileResponse | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const loadMembers = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const data = await searchMembers(search.trim(), page, pageSize);
      setMembers(data.content);
      setMeta({
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        number: data.number,
        first: data.first,
        last: data.last,
      });
    } catch {
      setError('Unable to load members. Check the API connection and sign in again if needed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMembers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, page, pageSize]);

  const openMember = async (memberId: string) => {
    setSelectedLoading(true);
    try {
      setSelectedMember(await getMember(memberId));
    } finally {
      setSelectedLoading(false);
    }
  };

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    members,
    meta,
    loading,
    refreshing,
    error,
    reload: () => void loadMembers(true),
    selectedMember,
    selectedLoading,
    openMember,
    closeMember: () => setSelectedMember(null),
  };
}
