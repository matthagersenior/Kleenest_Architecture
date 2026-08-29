import { useSearchParams } from 'react-router-dom';
import VisitSurface from './VisitSurface.jsx';
import QrLandingPage from './QrLandingPage.jsx';

export default function QrAwareVisitSurface(){
  const [params]=useSearchParams();
  const code=params.get('qr')||'';
  return code ? <QrLandingPage code={code}/> : <VisitSurface/>;
}
