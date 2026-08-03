import { useMemo, useState } from "react";

import type { ValidationRule } from "@/utils/validation";
import { validateField } from "@/utils/validation";

export function useFormField<T = string>(
  initialValue: T,
  rules: ValidationRule<T>[] = [],
) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);

  const validationKey = useMemo(
    () => validateField(value, rules),
    [value, rules],
  );

  return {
    value,
    setValue,
    isValid: validationKey === null,
    errorKey: touched ? validationKey : null,
    onBlur: () => setTouched(true),
  };
}
