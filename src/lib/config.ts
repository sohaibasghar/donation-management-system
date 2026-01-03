export const ORGANIZATION_NAME =
  process.env.NEXT_PUBLIC_ORGANIZATION_NAME ||
  'Bhatti Welfare Management System';

export function getOrganizationInitials(): string {
  return ORGANIZATION_NAME.split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

