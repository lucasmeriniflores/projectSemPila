import React from 'react';
import {
  Smartphone,
  Scissors,
  Sparkles,
  TrendingUp,
  Bike,
  Utensils,
  ShoppingCart,
  Home,
  Pill,
  Car,
  Plane,
  Gamepad2,
  Gift,
  Dog,
  Lightbulb,
  CreditCard,
  Dumbbell,
  BookOpen,
  Shirt,
  Coffee,
  Wrench,
  Tag,
  Wifi,
  Film,
  GraduationCap,
  Briefcase,
  LucideProps,
} from 'lucide-react';

export interface IconOption {
  id: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

export const CATEGORY_ICONS: Record<string, React.ComponentType<LucideProps>> = {
  smartphone: Smartphone,
  scissors: Scissors,
  sparkles: Sparkles,
  'trending-up': TrendingUp,
  bike: Bike,
  utensils: Utensils,
  'shopping-cart': ShoppingCart,
  home: Home,
  pill: Pill,
  car: Car,
  plane: Plane,
  gamepad: Gamepad2,
  gift: Gift,
  dog: Dog,
  lightbulb: Lightbulb,
  'credit-card': CreditCard,
  dumbbell: Dumbbell,
  book: BookOpen,
  shirt: Shirt,
  coffee: Coffee,
  wrench: Wrench,
  wifi: Wifi,
  film: Film,
  graduation: GraduationCap,
  briefcase: Briefcase,
  tag: Tag,
};

export const AVAILABLE_ICON_KEYS = Object.keys(CATEGORY_ICONS);

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  // If the stored value was an old emoji (e.g. from previous storage), map it gracefully
  const normalizedKey = mapLegacyEmojiToKey(name);
  const IconComponent = CATEGORY_ICONS[normalizedKey] || CATEGORY_ICONS.tag;
  return <IconComponent {...props} />;
};

function mapLegacyEmojiToKey(val: string): string {
  if (!val) return 'tag';
  if (CATEGORY_ICONS[val]) return val;

  const emojiMap: Record<string, string> = {
    '📱': 'smartphone',
    '✂️': 'scissors',
    '🍻': 'sparkles',
    '📈': 'trending-up',
    '🏍️': 'bike',
    '🍔': 'utensils',
    '🛒': 'shopping-cart',
    '🏠': 'home',
    '💊': 'pill',
    '🚗': 'car',
    '✈️': 'plane',
    '🎮': 'gamepad',
    '🎁': 'gift',
    '🐶': 'dog',
    '💡': 'lightbulb',
    '💳': 'credit-card',
    '🏋️': 'dumbbell',
    '📚': 'book',
    '👕': 'shirt',
    '☕': 'coffee',
    '🔧': 'wrench',
  };

  return emojiMap[val] || 'tag';
}
