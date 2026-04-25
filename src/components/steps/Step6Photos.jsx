import { PHOTO_SECTIONS } from '../../constants/standards';
import PhotoUploader from '../PhotoUploader';

export default function Step6Photos({ report, onChange }) {
  const updatePhotos = (key, photos) => {
    onChange({
      ...report,
      photos: { ...report.photos, [key]: photos },
    });
  };
  
  return (
    <div>
      <h3 className="step-title">사진 업로드</h3>
      <p className="step-desc">항목별 검사 사진을 첨부하세요 (최대 3장)</p>
      
      {PHOTO_SECTIONS.map(section => (
        <PhotoUploader
          key={section.key}
          section={section}
          photos={report.photos[section.key] || []}
          onChange={(photos) => updatePhotos(section.key, photos)}
        />
      ))}
    </div>
  );
}
