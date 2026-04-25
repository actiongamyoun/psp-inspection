import { useRef } from 'react';

// 사진 1장을 Base64로 변환 (압축 포함)
const fileToBase64Compressed = (file, maxWidth = 1280, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 리사이즈
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
  const inputRef = useRef(null);
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
    if (inputRef.current) inputRef.current.value = '';
  };
  
  const handleDelete = (idx) => {
    if (!confirm('이 사진을 삭제할까요?')) return;
    onChange(photos.filter((_, i) => i !== idx));
  };
  
  return (
    <div className="photo-section">
      <div className="photo-section-title">
        <span>{section.label} <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>({section.en})</span></span>
        <span className="photo-count">{photos.length}/{max}</span>
      </div>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <div key={i} className="photo-thumb" style={{ backgroundImage: `url(${src})` }}>
            <button type="button" className="photo-del" onClick={() => handleDelete(i)}>✕</button>
          </div>
        ))}
        {photos.length < max && (
          <button
            type="button"
            className="photo-thumb add"
            onClick={() => inputRef.current?.click()}
          >
            <span className="plus">+</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={handleAdd}
      />
    </div>
  );
}
