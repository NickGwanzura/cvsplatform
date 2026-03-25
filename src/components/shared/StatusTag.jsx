const MAP = {
  pending:    { cls: 't-pen',  label: 'PENDING' },
  approved:   { cls: 't-apv',  label: 'APPROVED' },
  review:     { cls: 't-rev',  label: 'IN REVIEW' },
  rejected:   { cls: 't-rej',  label: 'REJECTED' },
  paid:       { cls: 't-paid', label: 'PAID' },
  exception:  { cls: 't-exc',  label: 'EXCEPTION' },
  alert:      { cls: 't-alert',label: 'ALERT' },
  monitor:    { cls: 't-pen',  label: 'MONITOR' },
  ok:         { cls: 't-apv',  label: 'OK' },
  settled:    { cls: 't-apv',  label: 'SETTLED' },
  within:     { cls: 't-apv',  label: 'WITHIN LIMIT' },
  over:       { cls: 't-alert',label: 'OVER LIMIT' },
  active:     { cls: 't-apv',  label: 'ACTIVE' },
  brandmgr:   { cls: 't-rev',  label: 'BRAND MGR' },
  accountant: { cls: 't-rev',  label: 'ACCOUNTANT' },
  shopmgr:    { cls: 't-pen',  label: 'SHOP MGR' },
  procurement:{ cls: 't-exc',  label: 'PROCUREMENT' },
};

export default function StatusTag({ type, label }) {
  const t = MAP[type] || { cls: 't-rev', label: label || type };
  return (
    <span className={`tag ${t.cls}`}>
      <span className="td2" />
      {label || t.label}
    </span>
  );
}
