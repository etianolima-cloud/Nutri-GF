// Utilitários para formatação e cálculos clínicos

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatTimeInput(raw: string): string {
  // Converte ex: 6 -> 06:00, 630 -> 06:30, 2230 -> 22:30, 8 -> 08:00
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';

  if (digits.length === 1) {
    return `0${digits}:00`;
  }
  if (digits.length === 2) {
    const num = parseInt(digits, 10);
    if (num <= 23) {
      return `${digits}:00`;
    }
    // ex: digitou 63 -> 06:30
    return `0${digits[0]}:${digits[1]}0`;
  }
  if (digits.length === 3) {
    // ex: 630 -> 06:30
    const h = `0${digits[0]}`;
    const m = digits.slice(1);
    return `${h}:${m}`;
  }
  if (digits.length === 4) {
    // ex: 2230 -> 22:30
    const h = digits.slice(0, 2);
    const m = digits.slice(2);
    return `${h}:${m}`;
  }
  return raw;
}

export function calculateAge(birthDateStr: string): number | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export function calculateIMC(pesoKg: number | null | undefined, alturaCm: number | null | undefined): {
  imc: number | null;
  classificacao: string;
} {
  if (!pesoKg || !alturaCm || pesoKg <= 0 || alturaCm <= 0) {
    return { imc: null, classificacao: '' };
  }

  const alturaMetros = alturaCm / 100;
  const valor = Number((pesoKg / (alturaMetros * alturaMetros)).toFixed(1));

  let classificacao = '';
  if (valor < 18.5) classificacao = 'Abaixo do peso';
  else if (valor < 24.9) classificacao = 'Peso normal';
  else if (valor < 29.9) classificacao = 'Sobrepeso';
  else if (valor < 34.9) classificacao = 'Obesidade Grau I';
  else if (valor < 39.9) classificacao = 'Obesidade Grau II';
  else classificacao = 'Obesidade Grau III';

  return { imc: valor, classificacao };
}

