'use client';

import { useTranslations } from 'next-intl';
import { AI_LEVELS, CHALLENGES, FIELD_LIMITS, TOPICS } from '@/config/workshop';
import type { FieldErrors } from '../schema';
import { ChoiceList } from './ChoiceList';
import { sectionTitleClass } from './formStyles';
import { SelectField } from './SelectField';
import { TextField } from './TextField';

export function RegistrationNeeds({ errors }: { errors: FieldErrors }) {
  const t = useTranslations('workshop.register');
  const o = useTranslations('workshop.options');
  return (
    <section className="flex flex-col gap-4">
      <h2 className={sectionTitleClass}>{t('sections.needs')}</h2>
      <SelectField
        name="aiLevel"
        label={t('fields.aiLevel')}
        options={AI_LEVELS}
        optionLabel={(id) => o(`aiLevel.${id}`)}
        placeholder={t('fields.selectPlaceholder')}
        error={errors.aiLevel}
      />
      <TextField
        name="taskText"
        multiline
        maxLength={FIELD_LIMITS.taskText}
        label={t('fields.taskText')}
        hint={t('fields.taskTextHint')}
        error={errors.taskText}
      />
      <ChoiceList
        name="challenges"
        label={t('fields.challenges')}
        options={CHALLENGES}
        optionLabel={(id) => o(`challenges.${id}`)}
        error={errors.challenges}
      />
      <ChoiceList
        name="topics"
        label={t('fields.topics')}
        hint={t('fields.topicsHint')}
        options={TOPICS}
        optionLabel={(id) => o(`topics.${id}`)}
        error={errors.topics}
      />
    </section>
  );
}
