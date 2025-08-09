export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different phone number lengths
  if (digits.length === 10) {
    // US phone number: (123) 456-7890
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US phone number with country code: +1 (123) 456-7890
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 7) {
    // Local number: 123-4567
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else if (digits.length > 11) {
    // International number: +XX XXX XXX XXXX
    const countryCode = digits.slice(0, digits.length - 10);
    const localNumber = digits.slice(-10);
    return `+${countryCode} ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6)}`;
  }

  // Return original if it doesn't match common patterns
  return phone;
};

export const formatDate = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (dateTime: string | null): string => {
  if (!dateTime) return '-';
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};


export const formatPrice = (price: number | undefined): string => {
  if (!price) return '0';
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};
// Helper function to format duration
export const formatDuration = (milliseconds: number | undefined): string => {
  if (!milliseconds) return '0';
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years >= 1) return `${years} year${years > 1 ? 's' : ''}`;
  if (months >= 1) return `${months} month${months > 1 ? 's' : ''}`;
  return `${days} day${days > 1 ? 's' : ''}`;
};