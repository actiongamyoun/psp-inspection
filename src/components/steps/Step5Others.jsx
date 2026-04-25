import InputField from '../InputField';
import { SECTION_ITEMS } from '../../constants/standards';

export default function Step5Others({ report, onChange }) {
  const updateItem = (key, item) => {
    onChange({
      ...report,
      items: { ...report.items, [key]: item },
    });
  };
  
  return (
    <div>
      <h3 className="step-title">기타 사항</h3>
      <p className="step-desc">The Others · 5개 항목</p>
      
      {SECTION_ITEMS.others.map(key => (
        <InputField
          key={key}
          itemKey={key}
          item={report.items[key]}
          onChange={updateItem}
          allItems={report.items}
        />
      ))}
    </div>
  );
}
