import React from 'react';
import { LegalDocument, Section } from '@/components/legal/LegalDocument';
import { PublicHead } from '@/components/seo/public-head';
import { useTranslation } from '@/i18n';
import { APP_NAME } from '@/constants/seo';
import { useSettingsStore } from '@/store/useSettingsStore';

const DESCRIPTIONS = {
  fr: "Politique de confidentialité de l'application Wallet : aucune donnée personnelle ou financière n'est collectée ou envoyée sur un serveur ; vos données restent stockées localement sur votre appareil.",
  en: "Privacy policy of the Wallet app: no personal or financial data is collected or sent to a server; your data stays stored locally on your device.",
} as const;

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);

  return (
    <>
      <PublicHead
        title={`${APP_NAME} — ${t('legal.privacy.title')}`}
        description={DESCRIPTIONS[language]}
        path="/legal/privacy"
      />
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
    </>
  );
}