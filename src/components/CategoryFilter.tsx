import { categoryInfo, type ServiceCategory } from '@/data/services';

interface CategoryFilterProps {
  selected: ServiceCategory | null;
  onSelect: (category: ServiceCategory | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const categories = Object.entries(categoryInfo) as [ServiceCategory, typeof categoryInfo[ServiceCategory]][];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === null
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-card text-foreground hover:bg-secondary border border-border'
        }`}
      >
        All Services
      </button>
      {categories.map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelect(selected === key ? null : key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            selected === key
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-foreground hover:bg-secondary border border-border'
          }`}
        >
          <span>{info.icon}</span>
          <span>{info.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
