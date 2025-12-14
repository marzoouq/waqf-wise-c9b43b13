/**
 * Hook للبحث في اللائحة التنفيذية
 * Regulations Search Hook
 */

import { useState, useMemo, useCallback } from 'react';
import { regulationsParts, RegulationPart } from '@/components/governance/regulations-data';

export interface SearchResult {
  partId: string;
  partTitle: string;
  chapterTitle: string;
  sectionTitle: string;
  matchedItem: string;
  matchIndex: number;
}

export function useRegulationsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParts, setExpandedParts] = useState<string[]>([]);

  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    regulationsParts.forEach((part) => {
      part.chapters.forEach((chapter) => {
        chapter.content.forEach((section) => {
          section.items.forEach((item, index) => {
            if (item.toLowerCase().includes(query)) {
              results.push({
                partId: part.id,
                partTitle: part.title,
                chapterTitle: chapter.title,
                sectionTitle: section.subtitle,
                matchedItem: item,
                matchIndex: index,
              });
            }
          });

          // البحث في العناوين أيضاً
          if (section.subtitle.toLowerCase().includes(query)) {
            results.push({
              partId: part.id,
              partTitle: part.title,
              chapterTitle: chapter.title,
              sectionTitle: section.subtitle,
              matchedItem: section.subtitle,
              matchIndex: -1,
            });
          }
        });

        // البحث في عناوين الفصول
        if (chapter.title.toLowerCase().includes(query)) {
          results.push({
            partId: part.id,
            partTitle: part.title,
            chapterTitle: chapter.title,
            sectionTitle: '',
            matchedItem: chapter.title,
            matchIndex: -1,
          });
        }
      });

      // البحث في عناوين الأجزاء
      if (part.title.toLowerCase().includes(query)) {
        results.push({
          partId: part.id,
          partTitle: part.title,
          chapterTitle: '',
          sectionTitle: '',
          matchedItem: part.title,
          matchIndex: -1,
        });
      }
    });

    return results;
  }, [searchQuery]);

  const filteredParts = useMemo<RegulationPart[]>(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return regulationsParts;
    }

    const matchedPartIds = new Set(searchResults.map(r => r.partId));
    return regulationsParts.filter(part => matchedPartIds.has(part.id));
  }, [searchQuery, searchResults]);

  const highlightText = useCallback((text: string): string => {
    if (!searchQuery.trim() || searchQuery.length < 2) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>');
  }, [searchQuery]);

  const goToResult = useCallback((result: SearchResult) => {
    setExpandedParts(prev => 
      prev.includes(result.partId) ? prev : [...prev, result.partId]
    );
    
    // Scroll to the part
    setTimeout(() => {
      const element = document.querySelector(`[data-part-id="${result.partId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    filteredParts,
    highlightText,
    goToResult,
    clearSearch,
    expandedParts,
    setExpandedParts,
    hasResults: searchResults.length > 0,
    resultsCount: searchResults.length,
  };
}
