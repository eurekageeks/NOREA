import { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadService } from '../../services';
import { assetUrl, parseError } from '../../services/api';

export function FieldWrap({ label, required, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label} {required && <span className="text-gold-dark">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, required, error, hint, id, className = '', inputClassName = '', ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} htmlFor={id} className={className}>
      <input id={id} className={`field ${error ? 'field-error' : ''} ${inputClassName}`} {...rest} />
    </FieldWrap>
  );
}

export function Textarea({ label, required, error, hint, id, rows = 4, className = '', ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} htmlFor={id} className={className}>
      <textarea id={id} rows={rows} className={`field resize-y ${error ? 'field-error' : ''}`} {...rest} />
    </FieldWrap>
  );
}

export function Select({ label, required, error, hint, id, options = [], placeholder, className = '', children, ...rest }) {
  return (
    <FieldWrap label={label} required={required} error={error} hint={hint} htmlFor={id} className={className}>
      <select id={id} className={`field ${error ? 'field-error' : ''}`} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    </FieldWrap>
  );
}

export function ImageUploader({ label, value, onChange, hint = 'JPG, PNG or WEBP up to 3 MB', aspect = 'aspect-[16/10]' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be 3 MB or smaller.');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadService.image(file, setProgress);
      onChange(res.data.url);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(parseError(err).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`relative w-44 shrink-0 overflow-hidden rounded-xl border border-beige bg-sand ${aspect}`}>
          {value ? (
            <>
              <img src={assetUrl(value)} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange('')}
                title="Remove image"
                className="absolute top-1.5 right-1.5 rounded-full bg-navy/80 p-1 text-white transition hover:bg-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted/60">
              <ImageIcon className="h-6 w-6" />
              <span className="mt-1 text-[0.7rem]">No image</span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-beige bg-white px-4 py-2 text-xs font-medium text-navy transition hover:border-gold hover:bg-ivory disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-gold-dark" />}
            {uploading ? `Uploading ${progress}%…` : value ? 'Replace Image' : 'Upload Image'}
          </button>
          <p className="text-xs text-muted">{hint}</p>
        </div>
      </div>
    </div>
  );
}
