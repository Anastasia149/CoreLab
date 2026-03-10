import { useState, useCallback } from 'react';

export function useFormFields<T extends Record<string, any>>(initialState: T) {
  const [fields, setFields] = useState<T>(initialState);

  const handleChange = useCallback(
    (key: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFields(prev => ({ ...prev, [key]: value }));
      },
    []
  );

  const setFieldValue = useCallback((key: keyof T, value: any) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setFields(initialState), [initialState]);

  return { fields, handleChange, setFieldValue, reset, setFields };
}
