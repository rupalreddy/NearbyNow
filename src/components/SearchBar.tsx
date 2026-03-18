import { Search, MapPin } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
}

const SearchBar = ({ query, onQueryChange }: SearchBarProps) => {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search for hospitals, food, repairs..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full pl-11 pr-32 py-3.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm shadow-sm transition-shadow focus:shadow-md"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2.5 py-1.5 rounded-lg">
        <MapPin size={12} />
        <span>Downtown</span>
      </div>
    </div>
  );
};

export default SearchBar;
