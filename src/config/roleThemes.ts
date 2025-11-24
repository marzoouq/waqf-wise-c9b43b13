import { 
  Shield, 
  DollarSign, 
  Wallet, 
  User, 
  Archive,
  UserCog,
  type LucideIcon 
} from "lucide-react";

export interface RoleTheme {
  primary: string;
  accent: string;
  icon: LucideIcon;
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export const roleThemes: Record<string, RoleTheme> = {
  nazer: {
    primary: 'hsl(221, 83%, 53%)',
    accent: 'hsl(210, 100%, 45%)',
    icon: Shield,
    gradient: 'from-blue-600 to-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500'
  },
  accountant: {
    primary: 'hsl(142, 71%, 45%)',
    accent: 'hsl(142, 76%, 36%)',
    icon: DollarSign,
    gradient: 'from-green-600 to-green-800',
    bgColor: 'bg-green-50 dark:bg-green-950',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-500'
  },
  cashier: {
    primary: 'hsl(38, 92%, 50%)',
    accent: 'hsl(32, 95%, 44%)',
    icon: Wallet,
    gradient: 'from-orange-500 to-orange-700',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-500'
  },
  beneficiary: {
    primary: 'hsl(262, 83%, 58%)',
    accent: 'hsl(263, 70%, 50%)',
    icon: User,
    gradient: 'from-purple-600 to-purple-800',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-500'
  },
  archivist: {
    primary: 'hsl(24, 70%, 50%)',
    accent: 'hsl(25, 75%, 47%)',
    icon: Archive,
    gradient: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500'
  },
  admin: {
    primary: 'hsl(0, 84%, 60%)',
    accent: 'hsl(0, 72%, 51%)',
    icon: UserCog,
    gradient: 'from-red-600 to-red-800',
    bgColor: 'bg-red-50 dark:bg-red-950',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-500'
  },
  user: {
    primary: 'hsl(240, 5%, 26%)',
    accent: 'hsl(240, 6%, 10%)',
    icon: User,
    gradient: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-500'
  }
};

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    nazer: 'الناظر',
    admin: 'المشرف',
    accountant: 'المحاسب',
    cashier: 'أمين الصندوق',
    archivist: 'الأرشيفي',
    beneficiary: 'المستفيد',
    user: 'مستخدم'
  };
  return roleNames[role] || role;
}

export function getRoleTheme(role: string): RoleTheme {
  return roleThemes[role] || roleThemes.user;
}
