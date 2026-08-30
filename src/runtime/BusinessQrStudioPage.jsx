import { RefreshCw } from 'lucide-react';
import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import QrStudioSurface from './QrStudioSurface.jsx';

export default function BusinessQrStudioPage(){
 const{selectedBusiness}=useAppContext();
 return <WorkspaceShell workspace="business"><main className="page qr-studio-page"><div className="page-header"><div><span className="eyebrow">BUSINESS · QR STUDIO</span><h1>QR Studio</h1><p>Design, publish, print, track, and optimize every QR experience across your business locations.</p></div><RefreshCw size={20}/></div><QrStudioSurface business={selectedBusiness}/></main></WorkspaceShell>;
}
