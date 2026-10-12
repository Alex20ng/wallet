import React from 'react';
import { LegalDocument, Section } from '@/components/legal/LegalDocument';
import { useTranslation } from '@/i18n';

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <LegalDocument
      title={t('legal.privacy.title')}
      date={t('legal.lastUpdatedMonth')}
    >
      <Section title={t('legal.privacy.s1.title')}>{t('legal.privacy.s1.body')}</Section>
      <Section title={t('legal.privacy.s2.title')}>{t('legal.privacy.s2.body')}</Section>
      <Section title={t('legal.privacy.s3.title')}>{t('legal.privacy.s3.body')}</Section>
      <Section title={t('legal.privacy.s4.title')}>{t('legal.privacy.s4.body')}</Section>
      <Section title={t('legal.privacy.s5.title')}>{t('legal.privacy.s5.body')}</Section>
      <Section title={t('legal.privacy.s6.title')}>{t('legal.privacy.s6.body')}</Section>
      <Section title={t('legal.privacy.s7.title')}>{t('legal.privacy.s7.body')}</Section>
      <Section title={t('legal.privacy.s8.title')}>{t('legal.privacy.s8.body')}</Section>
    </LegalDocument>
  );
}
