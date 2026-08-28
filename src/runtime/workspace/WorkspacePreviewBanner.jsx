import { X } from 'lucide-react';

export default function WorkspacePreviewBanner({ label, onExit }) {
 return <div className="preview-banner" role="status"><span>Owner preview · {label} experience · presentation only</span><button type="button" className="button secondary" onClick={onExit}><X size={14}/>Exit preview</button></div>;
}
