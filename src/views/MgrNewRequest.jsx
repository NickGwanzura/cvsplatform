import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubmitRequestModal, NewSupplierModal } from '../components/modals/AllModals';

const STEPS = ['Details', 'Supplier', 'Submit'];
const CATEGORIES = ['Maintenance & Repairs', 'Cleaning Supplies', 'Stationery', 'Gas & Utilities', 'Emergency', 'Other'];
const SUPPLIERS = [
  { label: 'CleanPro Supplies (CP-0012)', wallet: 'IB-0773-8812' },
  { label: 'ZimGas Ltd (ZG-0034)', wallet: 'IB-0774-3344' },
  { label: 'Swift Maintenance (SM-0067)', wallet: 'IB-0771-2244' },
];

export default function MgrNewRequest() {
  const { navigate, openModal, addToast, modals, closeModal } = useApp();
  const [step, setStep] = useState(0);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    amount: '',
    purpose: '',
    supplier: '',
    file: null,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.amount || +form.amount <= 0) errs.amount = 'Enter a valid amount';
      if (+form.amount > 80) errs.amount = 'Exceeds available balance of $80. An exception will be required.';
      if (!form.purpose.trim()) errs.purpose = 'Describe what funds will be used for';
    }
    if (s === 1) {
      if (!form.supplier) errs.supplier = 'Select a verified supplier';
    }
    return errs;
  };

  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = () => {
    setShowSubmit(true);
    addToast('ok', 'Request submitted for review', 'PC-0042 forwarded to Brand Accountant');
  };

  const selectedSupplier = SUPPLIERS.find(s => s.label === form.supplier);

  return (
    <>
      <div className="ph">
        <div className="bc">CVS <span>/</span> Chicken Inn <span>/</span> Sh-14 <span>/</span> New Request</div>
        <div className="pt">Submit Petty Cash Request</div>
        <div className="pd">Funds disbursed via InnBucks upon Brand Manager approval</div>
      </div>
      <div className="cnt">
        {/* Steps */}
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={label} className={`step${i === step ? ' on' : i < step ? ' dn' : ''}`}>
              <div className="sn">{i < step ? '✓' : i + 1}</div>
              <div className="sl">{label}</div>
            </div>
          ))}
        </div>

        {/* Step 0 — Details */}
        {step === 0 && (
          <div className="fg" style={{ marginBottom: 1 }}>
            <div className="fi">
              <label className="fl">Brand</label>
              <select className="fsel" disabled><option>Chicken Inn</option></select>
              <div className="fh">Locked to your assigned brand</div>
            </div>
            <div className="fi">
              <label className="fl">Shop</label>
              <select className="fsel" disabled><option>Sh-14 Borrowdale</option></select>
              <div className="fh">Locked to your assigned shop</div>
            </div>
            <div className="fi">
              <label className="fl">Category</label>
              <select className="fsel" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fi">
              <label className="fl">Amount (USD)</label>
              <input className="fin" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" />
              {errors.amount
                ? <div className="fh" style={{ color: 'var(--er-t)' }}>{errors.amount}</div>
                : <div className="fh">Available: $80 of $800 limit · Threshold active</div>
              }
            </div>
            <div className="fi full">
              <label className="fl">Purpose / Description</label>
              <input className="fin" type="text" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Describe what the funds will be used for" />
              {errors.purpose && <div className="fh" style={{ color: 'var(--er-t)' }}>{errors.purpose}</div>}
            </div>
          </div>
        )}

        {/* Step 1 — Supplier */}
        {step === 1 && (
          <div className="fg" style={{ marginBottom: 1 }}>
            <div className="fi full">
              <label className="fl">Select Supplier</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                <select className="fsel" style={{ flex: 1 }} value={form.supplier} onChange={e => set('supplier', e.target.value)}>
                  <option value="">— Choose verified supplier —</option>
                  {SUPPLIERS.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                </select>
                <button className="ab gho" style={{ height: 34, whiteSpace: 'nowrap' }} onClick={() => setShowNewSupplier(true)}>+ New Supplier</button>
              </div>
              {errors.supplier
                ? <div className="fh" style={{ color: 'var(--er-t)' }}>{errors.supplier}</div>
                : <div className="fh">Only verified suppliers shown. Register new suppliers via Procurement.</div>
              }
            </div>
            {selectedSupplier && (
              <div className="fi full">
                <div style={{ background: 'var(--ok-bg)', border: '1px solid var(--ok)', padding: 10 }}>
                  <div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", marginBottom: 4 }}>SUPPLIER DETAILS</div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div><div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>INNBUCKS WALLET</div><div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", color: 'var(--int)' }}>{selectedSupplier.wallet}</div></div>
                    <div><div style={{ fontSize: 10, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace" }}>STATUS</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok-t)' }}>Verified ✓</div></div>
                  </div>
                </div>
              </div>
            )}
            <div className="fi full">
              <label className="fl">Attach Document (Invoice / Quote)</label>
              <input className="fin" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => set('file', e.target.files[0])}
                style={{ padding: '6px 10px', cursor: 'pointer' }} />
              {form.file && <div className="fh" style={{ color: 'var(--ok-t)' }}>📎 {form.file.name} — ready to attach</div>}
              {!form.file && <div className="fh">PDF or JPG, max 5 MB</div>}
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div>
            <div style={{ background: 'var(--l1)', border: '1px solid var(--bs)', padding: 16, marginBottom: 13 }}>
              <div style={{ fontSize: 11, color: 'var(--ts)', fontFamily: "'IBM Plex Mono',monospace", textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Request Summary</div>
              {[
                { label: 'Brand / Shop', value: 'Chicken Inn — Sh-14 Borrowdale' },
                { label: 'Category', value: form.category },
                { label: 'Amount (USD)', value: <span style={{ fontWeight: 700, color: 'var(--int)', fontSize: 18, fontFamily: "'IBM Plex Sans Condensed',sans-serif" }}>${parseFloat(form.amount || 0).toFixed(2)}</span> },
                { label: 'Purpose', value: form.purpose },
                { label: 'Supplier', value: form.supplier },
                { label: 'InnBucks Wallet', value: <code style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{selectedSupplier?.wallet || '—'}</code> },
                { label: 'Document', value: form.file ? `📎 ${form.file.name}` : 'No document attached' },
              ].map((row, i, arr) => (
                <div key={i} className="cvs-detail-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs)' : 'none' }}>
                  <span className="cvs-detail-label">{row.label}</span>
                  <span style={{ fontSize: 13 }}>{row.value}</span>
                </div>
              ))}
            </div>
            {+form.amount > 80 ? (
              <div style={{ padding: 10, background: 'var(--er-bg)', borderLeft: '3px solid var(--er)', marginBottom: 13 }}>
                <div style={{ fontSize: 11, color: 'var(--er-t)', fontWeight: 600 }}>⚠ Threshold Notice</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>Sh-14 at 90% of monthly limit. This request will trigger exception review by Brand Accountant.</div>
              </div>
            ) : (
              <div style={{ padding: 10, background: 'var(--info-bg)', borderLeft: '3px solid var(--int)', marginBottom: 13 }}>
                <div style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600 }}>ℹ Review before submitting</div>
                <div style={{ fontSize: 11, color: 'var(--ts)', marginTop: 2 }}>Once submitted, this request is forwarded to the Brand Accountant for validation. You will be notified of the outcome.</div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 0, marginTop: 16 }}>
          {step === 0
            ? <button className="ab sec" style={{ height: 44, padding: '0 20px' }} onClick={() => navigate({ v: 'mgr-dashboard', lb: 'Dashboard' }, 0)}>Cancel</button>
            : <button className="ab sec" style={{ height: 44, padding: '0 20px' }} onClick={back}>← Back</button>
          }
          {step < STEPS.length - 1
            ? <button className="ab pri" style={{ height: 44, padding: '0 24px' }} onClick={next}>Continue →</button>
            : <button className="ab pri" style={{ height: 44, padding: '0 24px' }} onClick={handleSubmit}>Submit Request</button>
          }
        </div>
      </div>

      <SubmitRequestModal
        open={showSubmit}
        onClose={() => { setShowSubmit(false); navigate({ v: 'mgr-dashboard', lb: 'Dashboard' }, 0); }}
        formData={{ brand: 'Chicken Inn', shop: 'Sh-14', supplier: form.supplier || 'CleanPro Supplies', category: form.category, amount: parseFloat(form.amount || 0).toFixed(2) }}
      />
      <NewSupplierModal open={showNewSupplier} onClose={() => setShowNewSupplier(false)} />
    </>
  );
}
