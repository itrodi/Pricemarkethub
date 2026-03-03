import {
  Wheat,
  Fuel,
  Smartphone,
  Banknote,
  Building2,
  Car,
  UtensilsCrossed,
  Gem,
  Package,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  wheat: Wheat,
  fuel: Fuel,
  smartphone: Smartphone,
  banknote: Banknote,
  building: Building2,
  car: Car,
  utensils: UtensilsCrossed,
  gem: Gem,
  package: Package,
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export default function CategoryIcon({ icon, color, size = 20 }: CategoryIconProps) {
  const IconComponent = iconMap[icon] || Package;

  return (
    <div
      className="category-card-icon"
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent size={size} color={color} />
    </div>
  );
}
