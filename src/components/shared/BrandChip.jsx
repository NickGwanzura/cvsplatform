import { useApp } from '../../context/AppContext';

const CLS = {
  'Chicken Inn': 'bci', 'Pizza Inn': 'bcp', 'Creamy Inn': 'bcc',
  "Nando's": 'bcn', 'Steers': 'bcs', "Roco Mamma's": 'bcr',
  'Ocean Basket': 'bcob', 'Hefelies': 'bchf', "Pastino's": 'bcpa',
};
const SHORT = {
  'Chicken Inn':'CI','Pizza Inn':'PI','Creamy Inn':'CR',"Nando's":'ND',
  'Steers':'ST',"Roco Mamma's":'RM','Ocean Basket':'OB','Hefelies':'HF',"Pastino's":'PA',
};

export default function BrandChip({ brand, short }) {
  const { brandFilter, setBrandFilter } = useApp();
  const cls = CLS[brand] || 'bci';
  const isActive = brandFilter === brand;
  return (
    <span
      className={`bc2 ${cls}`}
      style={{
        cursor: 'pointer',
        outline: isActive ? '2px solid var(--int)' : 'none',
        outlineOffset: 1,
      }}
      title={`Click to filter by ${brand}`}
      onClick={() => setBrandFilter(isActive ? 'All Brands' : brand)}
    >{short ? (SHORT[brand] || brand) : brand}</span>
  );
}
