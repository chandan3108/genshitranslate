'use client';

import React from 'react';
import {
  Store,
  Utensils,
  Train,
  Soup,
  Car,
  Building2,
  ShoppingBag,
  Pill,
  Compass,
  CreditCard,
  FileText,
  UtensilsCrossed,
  LucideIcon,
} from 'lucide-react';
import { SituationId } from '@/lib/types';

interface SituationIconProps {
  id: SituationId | string;
  className?: string;
}

export const getSituationIconComponent = (id: string): LucideIcon => {
  switch (id) {
    case 'konbini':
      return Store;
    case 'izakaya':
      return Utensils;
    case 'train':
      return Train;
    case 'ramen':
      return Soup;
    case 'taxi':
      return Car;
    case 'hotel':
      return Building2;
    case 'shopping':
      return ShoppingBag;
    case 'pharmacy':
      return Pill;
    case 'general':
      return Compass;
    default:
      return Compass;
  }
};

export const SituationIcon: React.FC<SituationIconProps> = ({ id, className = 'w-4 h-4' }) => {
  const IconComponent = getSituationIconComponent(id);
  return <IconComponent className={className} />;
};
