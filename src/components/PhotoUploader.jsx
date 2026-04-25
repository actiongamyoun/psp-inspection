import { useRef } from 'react';

// 사진 1장을 Base64로 변환 (압축 포함)
const fileToBase64Compressed = (file, maxWidth = 1280, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function PhotoUploader({ section, photos = [], onChange }) {
  const cameraRef = useRef(null);   // 카메라 직접 촬영
  const galleryRef = useRef(null);  // 갤러리 선택

  const max = section.max;
  const remaining = max - photos.length;

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const toAdd = files.slice(0, remaining);
    const newPhotos = [...photos];

    for (const file of toAdd) {
      try {
        const base64 = await fileToBase64Compressed(file);
        newPhotos.push(base64);
      } catch (err) {
        console.error('사진 처리 실패', err);
      }
    }

    onChange(newPhotos);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const handleDelete = (idx) => {
    if (!confirm('이 사진을 삭제할까요?')) return;
    onChange(photos.filter((_, i) => i !== idx));
  };

  const isFull = photos.length >= max;

  return (
    <div className="photo-section">
      <div className="photo-section-title">
        <span>
          {section.label}{' '}
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>
            ({section.en})
          </span>
        </span>
        <span className="photo-count">{photos.length}/{max}</span>
      </div>

      {/* 썸네일 그리드 */}
      <div className="photo-grid">
        {photos.map((src, i) => (
          <div
            key={i}
            className="photo-thumb"
            style={{ backgroundImage: `url(${src})` }}
          >
            <button
              type="button"
              className="photo-del"
              onClick={() => handleDelete(i)}
            >
              ✕
            </button>
          </div>
        ))}
        {/* 빈 슬롯 표시 */}
        {!isFull && (
          <div
            className="photo-thumb add"
            style={{ border: '2px dashed #e0e0e0', background: '#fafafa' }}
          />
        )}
      </div>

      {/* 카메라 / 갤러리 버튼 */}
      {!isFull && (
        <div className="photo-btn-row">
          <button
            type="button"
            className="photo-source-btn"
            onClick={() => cameraRef.current?.click()}
          >
            📷 카메라
          </button>
          <button
            type="button"
            className="photo-source-btn"
            onClick={() => galleryRef.current?.click()}
          >
            🖼 사진첩
          </button>
        </div>
      )}

      {/* 카메라 input - capture=environment */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={handleAdd}
      />

      {/* 갤러리 input - capture 없음 → 사진첩 열림 */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleAdd}
      />
    </div>
  );
}
