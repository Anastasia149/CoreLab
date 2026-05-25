export type CardPaymentFields = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export type CardPaymentErrors = Partial<Record<keyof CardPaymentFields, string>>;

export function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

export function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvcInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 3);
}

export function validateCardName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Введите имя на карте';
  if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(trimmed)) {
    return 'Имя может содержать только буквы, пробелы и дефис';
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return 'Укажите имя и фамилию';
  if (parts.some((part) => part.length < 2)) {
    return 'Укажите полное имя и фамилию';
  }
  return null;
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function validateCardNumber(cardNumber: string): string | null {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return 'Введите номер карты';
  if (digits.length !== 16) return 'Номер карты должен содержать 16 цифр';
  if (!luhnCheck(digits)) return 'Неверный номер карты';
  return null;
}

export function validateExpiry(expiry: string): string | null {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return 'Укажите срок в формате ММ/ГГ';
  }
  const [mmStr, yyStr] = expiry.split('/');
  const month = Number(mmStr);
  const year = 2000 + Number(yyStr);
  if (month < 1 || month > 12) return 'Некорректный месяц';

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Срок действия истёк';
  }
  return null;
}

export function validateCvc(cvc: string): string | null {
  if (!cvc) return 'Введите CVC';
  if (cvc.length !== 3) return 'CVC должен содержать 3 цифры';
  return null;
}

export function validateCardPayment(fields: CardPaymentFields): CardPaymentErrors {
  const errors: CardPaymentErrors = {};
  const cardNameError = validateCardName(fields.cardName);
  const cardNumberError = validateCardNumber(fields.cardNumber);
  const expiryError = validateExpiry(fields.expiry);
  const cvcError = validateCvc(fields.cvc);

  if (cardNameError) errors.cardName = cardNameError;
  if (cardNumberError) errors.cardNumber = cardNumberError;
  if (expiryError) errors.expiry = expiryError;
  if (cvcError) errors.cvc = cvcError;

  return errors;
}

export function isCardPaymentValid(fields: CardPaymentFields): boolean {
  return Object.keys(validateCardPayment(fields)).length === 0;
}
