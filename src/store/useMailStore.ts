'use client';

import { create } from 'zustand';
import { Alias, Message, Domain } from '@/types/database';

interface MailStore {
  // Domains
  domains: Domain[];
  selectedDomain: Domain | null;
  setDomains: (domains: Domain[]) => void;
  setSelectedDomain: (domain: Domain | null) => void;

  // Aliases
  aliases: Alias[];
  activeAlias: Alias | null;
  setAliases: (aliases: Alias[]) => void;
  setActiveAlias: (alias: Alias | null) => void;
  addAlias: (alias: Alias) => void;

  // Messages
  messages: Message[];
  selectedMessage: Message | null;
  setMessages: (messages: Message[]) => void;
  setSelectedMessage: (message: Message | null) => void;
  addMessage: (message: Message) => void;
  markAsRead: (messageId: string) => void;

  // Filter
  filterAliasId: string | null;
  setFilterAliasId: (aliasId: string | null) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useMailStore = create<MailStore>((set) => ({
  // Domains
  domains: [],
  selectedDomain: null,
  setDomains: (domains) => set({ domains }),
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),

  // Aliases
  aliases: [],
  activeAlias: null,
  setAliases: (aliases) => set({ aliases }),
  setActiveAlias: (alias) => set({ activeAlias: alias }),
  addAlias: (alias) => set((state) => ({ aliases: [alias, ...state.aliases] })),

  // Messages
  messages: [],
  selectedMessage: null,
  setMessages: (messages) => set({ messages }),
  setSelectedMessage: (message) => set({ selectedMessage: message }),
  addMessage: (message) =>
    set((state) => ({ messages: [message, ...state.messages] })),
  markAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, is_read: true } : m
      ),
    })),

  // Filter
  filterAliasId: null,
  setFilterAliasId: (aliasId) => set({ filterAliasId: aliasId }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
