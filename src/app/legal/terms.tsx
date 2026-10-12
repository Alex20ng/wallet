import React from 'react';
import { LegalDocument, Section } from '@/components/legal/LegalDocument';
import { useTranslation } from '@/i18n';

export default function TermsOfServiceScreen() {
  const { t } = useTranslation();

  return (
    <LegalDocument
      title={t('legal.terms.title')}
      date={t('legal.lastUpdatedMonth')}
    >
      <Section title={t('legal.terms.a1.title')}>{t('legal.terms.a1.body')}</Section>
      <Section title={t('legal.terms.a2.title')}>
        {t('legal.terms.a2.body1')}

        {'\n\n'}

        {t('legal.terms.a2.body2')}
      </Section>
      <Section title={t('legal.terms.a3.title')}>{t('legal.terms.a3.body')}</Section>
      <Section title={t('legal.terms.a4.title')}>{t('legal.terms.a4.body')}</Section>
      <Section title={t('legal.terms.a5.title')}>{t('legal.terms.a5.body')}</Section>
      <Section title={t('legal.terms.a6.title')}>{t('legal.terms.a6.body')}</Section>
      <Section title={t('legal.terms.a7.title')}>{t('legal.terms.a7.body')}</Section>
    </LegalDocument>
  );
}
