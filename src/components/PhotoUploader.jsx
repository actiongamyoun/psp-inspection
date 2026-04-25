import { useRef, useState } from 'react';

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
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
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
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [showSheet, setShowSheet] = useState(false);

  const max = section.max;
  const isFull = photos.length >= max;

  const handleAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = max - photos.length;
    const toAdd = files.slice(0, remaining);
    const newPhotos = [...photos];
    for (const file of toAdd) {
      try {
        newPhotos.push(await fileToBase64Compressed(file));
      } catch (err) {
        console.error('사진 처리 실패', err);
      }
    }
    onChange(newPhotos);
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
    setShowSheet(false);
  };

  const handleDelete = (idx) => {
    if (!confirm('이 사진을 삭제할까요?')) return;
    onChange(photos.filter((_, i) => i !== idx));
  };

  const handleCamera = () => {
    setShowSheet(false);
    setTimeout(() => cameraRef.current?.click(), 100);
  };

  const handleGallery = () => {
    setShowSheet(false);
    setTimeout(() => galleryRef.current?.click(), 100);
  };

  return (
    <>
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
          {!isFull && (
            <button
              type="button"
              className="photo-thumb add"
              onClick={() => setShowSheet(true)}
            >
              <span className="plus">+</span>
            </button>
          )}
        </div>
      </div>

      {/* 바텀시트 */}
      {showSheet && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setShowSheet(false)}
        >
          <div
            style={{
              width: '100%',
              background: 'white',
              borderRadius: '20px 20px 0 0',
              padding: '16px 20px 32px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: 40, height: 4, background: '#ddd',
              borderRadius: 2, margin: '0 auto 16px',
            }} />
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#666',
              textAlign: 'center', marginBottom: 14,
            }}>
              사진 추가 방법 선택
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleCamera}
                style={sheetBtnStyle}
              >
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>카메라</span>
              </button>
              <button
                onClick={handleGallery}
                style={sheetBtnStyle}
              >
                <span style={{ fontSize: 28 }}>🖼</span>
                <span style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>사진첩</span>
              </button>
            </div>
            <button
              onClick={() => setShowSheet(false)}
              style={{
                width: '100%', marginTop: 12, padding: 12,
                background: '#f5f5f5', border: 'none',
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                color: '#666', cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        multiple style={{ display: 'none' }} onChange={handleAdd} />
      <input ref={galleryRef} type="file" accept="image/*"
        multiple style={{ display: 'none' }} onChange={handleAdd} />
    </>
  );
}

const sheetBtnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '18px 12px',
  background: '#f5f7f5',
  border: '1.5px solid #e0e0e0',
  borderRadius: 14,
  cursor: 'pointer',
  gap: 2,
};
