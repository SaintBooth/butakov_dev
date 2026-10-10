'use client';

import { useTranslations } from 'next-intl';
import {
  COMPANY_SIZES,
  DECISION_ROLES,
  FIELD_LIMITS,
  INDUSTRIES,
  POSITION_LEVELS,
} from '@/config/workshop';
import type { FieldErrors } from '../schema';
import { sectionTitleClass } from './formStyles';
import { SelectField } from './SelectField';
import { TextField } from './TextField';
import { transliterateName } from '../domain/translit';
import { translatePosition } from '../domain/positionTitle';
import { useDerivedField } from './useDerivedField';

const englishPosition = (title: string) => translatePosition(title) ?? '';

export function RegistrationProfile({ errors }: { errors: FieldErrors }) {
  const t = useTranslations('workshop.register');
  const o = useTranslations('workshop.options');
  const placeholder = t('fields.selectPlaceholder');
  const latinName = useDerivedField(transliterateName, FIELD_LIMITS.fullNameLatin);
  const latinPosition = useDerivedField(englishPosition, FIELD_LIMITS.positionLatin);
  return (
    <section className="flex flex-col gap-4">
      <h2 className={sectionTitleClass}>{t('sections.about')}</h2>
      <TextField
        name="fullName"
        label={t('fields.fullName')}
        required
        maxLength={FIELD_LIMITS.fullName}
        autoComplete="name"
        error={errors.fullName}
        onValueChange={latinName.onSourceChange}
      />
      <TextField
        name="email"
        type="email"
        label={t('fields.email')}
        required
        maxLength={FIELD_LIMITS.email}
        autoComplete="email"
        hint={t('fields.emailHint')}
        error={errors.email}
      />
      <TextField
        name="company"
        label={t('fields.company')}
        required
        maxLength={FIELD_LIMITS.company}
        autoComplete="organization"
        hint={t('fields.companyHint')}
        error={errors.company}
      />
      <SelectField
        name="positionLevel"
        label={t('fields.positionLevel')}
        required
        options={POSITION_LEVELS}
        optionLabel={(id) => o(`positionLevel.${id}`)}
        placeholder={placeholder}
        error={errors.positionLevel}
      />
      <TextField
        name="positionTitle"
        label={t('fields.positionTitle')}
        maxLength={FIELD_LIMITS.positionTitle}
        autoComplete="organization-title"
        error={errors.positionTitle}
        onValueChange={latinPosition.onSourceChange}
      />
      <TextField
        name="fullNameLatin"
        label={t('fields.fullNameLatin')}
        maxLength={FIELD_LIMITS.fullNameLatin}
        hint={t('fields.fullNameLatinHint')}
        error={errors.fullNameLatin}
        value={latinName.value}
        onValueChange={latinName.onValueChange}
      />
      <TextField
        name="positionLatin"
        label={t('fields.positionLatin')}
        maxLength={FIELD_LIMITS.positionLatin}
        hint={t('fields.positionLatinHint')}
        error={errors.positionLatin}
        value={latinPosition.value}
        onValueChange={latinPosition.onValueChange}
      />
      <TextField
        name="profileUrl"
        type="url"
        label={t('fields.profileUrl')}
        maxLength={FIELD_LIMITS.profileUrl}
        hint={t('fields.profileUrlHint')}
        error={errors.profileUrl}
      />
      <SelectField
        name="industry"
        label={t('fields.industry')}
        options={INDUSTRIES}
        optionLabel={(id) => o(`industry.${id}`)}
        placeholder={placeholder}
        error={errors.industry}
      />
      <SelectField
        name="companySize"
        label={t('fields.companySize')}
        options={COMPANY_SIZES}
        optionLabel={(id) => o(`companySize.${id}`)}
        placeholder={placeholder}
        error={errors.companySize}
      />
      <SelectField
        name="decisionRole"
        label={t('fields.decisionRole')}
        options={DECISION_ROLES}
        optionLabel={(id) => o(`decisionRole.${id}`)}
        placeholder={placeholder}
        error={errors.decisionRole}
      />
    </section>
  );
}
