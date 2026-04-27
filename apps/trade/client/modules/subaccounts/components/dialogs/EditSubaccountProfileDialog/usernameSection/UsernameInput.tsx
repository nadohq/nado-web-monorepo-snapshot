import { SubaccountProfile } from '@nadohq/react-client';
import { CompactInput } from '@nadohq/web-ui';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<SubaccountProfile>;
  validateUsername: (username: string) => string | undefined;
  error: ReactNode;
}

export function UsernameInput({ form, error, validateUsername }: Props) {
  const { t } = useTranslation();

  const register = form.register('username', {
    validate: validateUsername,
  });

  return (
    <div className="flex flex-col gap-y-3">
      <CompactInput
        {...register}
        id={register.name}
        type="text"
        placeholder={t(($) => $.inputPlaceholders.enterAccountName)}
        errorTooltipContent={error}
      />
    </div>
  );
}
