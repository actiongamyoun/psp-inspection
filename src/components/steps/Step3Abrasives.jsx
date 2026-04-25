import InputField from '../InputField';
import { SECTION_ITEMS } from '../../constants/standards';

export default function Step3Abrasives({ report, onChange }) {
  const updateItem = (key, item) => {
    onChange({
      ...report,
      items: { ...report.items, [key]: item },
    });
  };
  
  return (
    <div>
      <h3 className="step-title">연마재</h3>
      <p className="step-desc">Abrasives</p>
      
      {SECTION_ITEMS.abrasives.map(key => (
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
