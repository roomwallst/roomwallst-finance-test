import { useEffect, useRef } from 'react';

interface Props {
  url: string;
  blob: Blob;
  onClose: () => void;
}

const FILE_NAME = 'roomwallst-financial-result.png';

export default function ImageModal({ url, blob, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const file = typeof File !== 'undefined' ? new File([blob], FILE_NAME, { type: 'image/png' }) : null;
  const canShare =
    !!file && typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const download = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    try {
      await navigator.share({ files: [file!], title: '방구석월가의 똑똑한 금융생활 첫걸음!' });
    } catch {
      /* 사용자가 공유를 취소한 경우 */
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 id="modal-title">결과 이미지</h2>
          <p>모바일에서는 이미지를 길게 눌러 사진에 저장할 수도 있어요.</p>
        </div>
        <div className="modal__img">
          <img src={url} alt="나의 금융생활 성향 결과 이미지" />
        </div>
        <div className="modal__actions">
          <button type="button" className="btn btn--gold btn--block" onClick={download}>이미지 다운로드</button>
          {canShare && (
            <button type="button" className="btn btn--navy btn--block" onClick={share}>공유하기 / 사진에 저장</button>
          )}
          <button type="button" className="btn btn--ghost btn--block" onClick={onClose} ref={closeRef}>닫기</button>
        </div>
      </div>
    </div>
  );
}
