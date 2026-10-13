import React from 'react';
import { LegalDocument, Section } from '@/components/legal/LegalDocument';
import { PublicHead } from '@/components/seo/public-head';
import { useTranslation } from '@/i18n';
import { APP_NAME } from '@/constants/seo';
import { useSettingsStore } from '@/store/useSettingsStore';

const DESCRIPTIONS = {
  fr: "Conditions générales d'utilisation de l'application Wallet : une gestionnaire de budget et de dépenses 100 % locale, sans compte, disponible sur Android, iOS et le web.",
  en: "Terms of use of the Wallet app: a 100 % local budget and expense manager, without an account, available on Android, iOS and the web.",
} as const;

export default function TermsOfServiceScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);

  return (
    <>
      <PublicHead
        title={`${APP_NAME} — ${t('legal.terms.title')}`}
        description={DESCRIPTIONS[language]}
        path="/legal/terms"
      />
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
    </>
  );
}