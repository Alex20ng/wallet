import React from 'react';
import AppTabs from '@/components/app-tabs';
import { NoIndexHead } from '@/components/seo/public-head';

export default function TabsLayout() {
  return (
    <>
      <NoIndexHead />
      <AppTabs />
    </>
  );
}
