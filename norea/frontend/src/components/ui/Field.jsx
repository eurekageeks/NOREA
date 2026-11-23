export function FieldWrap({ label, required, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
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
