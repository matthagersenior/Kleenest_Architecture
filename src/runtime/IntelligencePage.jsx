import { useAppContext } from '../AppContext.jsx';
import WorkspaceShell from './WorkspaceShell.jsx';
import CapabilityPanel, { MetricGrid } from './CapabilityPanel.jsx';

export default function IntelligencePage(){
  const {services}=useAppContext();
  return <WorkspaceShell workspace="platform">
    <section className="page-heading"><span className="eyebrow">Kleenest</span><h1>Network Intelligence</h1><p>Shared measurement across consumer behavior, businesses, fleets, enterprise partners and platform participation.</p></section>
    <CapabilityPanel title="Cross-tier leaderboard" load={()=>services.intelligence.crossTierLeaderboard('consumer_checkins',25)} renderData={data=><MetricGrid items={data}/>}/>
    <CapabilityPanel title="Platform progression leaderboard" load={()=>services.intelligence.platformLeaderboard('users:points',25)} renderData={data=><MetricGrid items={data}/>}/>
    <CapabilityPanel title="Business leaderboard" load={()=>services.intelligence.businessLeaderboard('check_ins',20)} renderData={data=><MetricGrid items={data}/>}/>
    <CapabilityPanel title="Fleet network leaderboard" load={()=>services.intelligence.fleetNetworkLeaderboard('stops_completed',20)} renderData={data=><MetricGrid items={data}/>}/>
    <CapabilityPanel title="Intelligence loop" load={async()=>({flow:'behavior → evidence → metric → leaderboard → reward → notification → network intelligence',sources:['QR','geofence','check-in','review','location quality','Quest','Fleet','Business','Enterprise']})} renderData={data=><MetricGrid items={data}/>}/>
  </WorkspaceShell>;
}
