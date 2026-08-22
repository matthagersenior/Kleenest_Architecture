import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import { ActionForm } from './CapabilityPanel.jsx';
export default function LocationEvidencePage() {
  const { services } = useAppContext();
  return <WorkspaceShell><section className="page-heading"><span className="eyebrow">Kleenest</span><h1>Location evidence</h1></section>
    <ActionForm title="Restroom observation" submitLabel="Submit observation" fields={[{ name:'locationId',label:'Location ID'},{ name:'checkInId',label:'Check-in ID',required:false},{ name:'observationType',label:'Observation type'},{ name:'cleanlinessPct',label:'Cleanliness %',required:false},{ name:'note',label:'Note',required:false}]} onSubmit={v => services.locationEvidence.restroomObservation(v)} />
    <ActionForm title="Amenity observation" submitLabel="Submit amenity" fields={[{ name:'locationId',label:'Location ID'},{ name:'amenityId',label:'Amenity ID'},{ name:'status',label:'Status'},{ name:'confidence',label:'Confidence',required:false},{ name:'verificationMethod',label:'Verification method',required:false},{ name:'checkInId',label:'Check-in ID',required:false},{ name:'photoId',label:'Photo ID',required:false},{ name:'notes',label:'Notes',required:false}]} onSubmit={v => services.locationEvidence.amenityObservation(v)} />
    <ActionForm title="Location quality" submitLabel="Submit quality" fields={[{ name:'locationId',label:'Location ID'},{ name:'stars',label:'Stars (1-5)'},{ name:'cleanliness',label:'Cleanliness',required:false},{ name:'accessibility',label:'Accessibility',required:false},{ name:'safety',label:'Safety',required:false},{ name:'availability',label:'Availability',required:false},{ name:'condition',label:'Condition',required:false},{ name:'feedback',label:'Feedback',required:false},{ name:'checkInId',label:'Check-in ID',required:false},{ name:'photoId',label:'Photo ID',required:false}]} onSubmit={v => services.locationEvidence.qualityObservation(v)} />
    <ActionForm title="Location verification" submitLabel="Verify location" fields={[{ name:'locationId',label:'Location ID'},{ name:'isOpen',label:'Open? (true/false)'},{ name:'hasBathroom',label:'Has bathroom? (true/false)'},{ name:'note',label:'Note',required:false}]} onSubmit={v => services.locationEvidence.verification(v)} />
  </WorkspaceShell>;
}
