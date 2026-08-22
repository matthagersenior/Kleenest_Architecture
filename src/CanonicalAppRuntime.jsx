import {Navigate,Route,Routes} from 'react-router-dom';
import Home from './runtime/Home.jsx';
import MapSurface from './runtime/MapSurface.jsx';
import RouteSurface from './runtime/RouteSurface.jsx';
import VisitSurface from './runtime/VisitSurface.jsx';
import FamilyPage from './runtime/FamilyPage.jsx';
import LocationEvidencePage from './runtime/LocationEvidencePage.jsx';
import EngagementPage from './runtime/EngagementPage.jsx';
import AuthPage from './runtime/AuthPage.jsx';
import ProfilePage from './runtime/ProfilePage.jsx';
import SupportPage from './runtime/SupportPage.jsx';
import AboutPage from './runtime/AboutPage.jsx';
import PricingPage from './runtime/PricingPage.jsx';
import NotificationPreferencesPage from './runtime/NotificationPreferencesPage.jsx';
import OwnerControlCenter from './runtime/OwnerControlCenter.jsx';
import OwnerCrudWorkbench from './runtime/OwnerCrudWorkbench.jsx';
import OwnerTierPreview from './runtime/OwnerTierPreview.jsx';
import OwnerAuditPage from './runtime/OwnerAuditPage.jsx';
import IntelligencePage from './runtime/IntelligencePage.jsx';
import BusinessIntelligencePage from './runtime/BusinessIntelligencePage.jsx';
import BusinessManagePage from './runtime/BusinessManagePage.jsx';
import FleetOperationsPage from './runtime/FleetOperationsPage.jsx';
import FleetPerformancePage from './runtime/FleetPerformancePage.jsx';
import FleetIntelligenceSurface from './runtime/FleetIntelligenceSurface.jsx';
import ConsumerActionCenter from './runtime/ConsumerActionCenter.jsx';
import EngagementOrchestrator from './runtime/EngagementOrchestrator.jsx';
import IntegrationHub from './runtime/IntegrationHub.jsx';
import CapabilityHubPage from './runtime/CapabilityHubPage.jsx';
import AdminMaintenancePage from './runtime/AdminMaintenancePage.jsx';
import ActivitySurface from './runtime/ActivitySurface.jsx';
import ProgressionPage from './runtime/ProgressionPage.jsx';
import SocialPage from './runtime/SocialPage.jsx';
import EnterpriseCommandCenterPage from './runtime/EnterpriseCommandCenterPage.jsx';

export default function CanonicalAppRuntime(){return <Routes>
<Route path="/" element={<Home/>}/><Route path="/capabilities" element={<CapabilityHubPage/>}/><Route path="/consumer" element={<Home/>}/>
<Route path="/integration" element={<IntegrationHub/>}/><Route path="/interactions" element={<VisitSurface/>}/><Route path="/qr" element={<VisitSurface/>}/><Route path="/geofence" element={<VisitSurface/>}/><Route path="/check-in" element={<VisitSurface/>}/>
<Route path="/auth" element={<AuthPage/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/notifications" element={<NotificationPreferencesPage/>}/><Route path="/pricing" element={<PricingPage/>}/><Route path="/support" element={<SupportPage/>}/><Route path="/about" element={<AboutPage/>}/>
<Route path="/map" element={<MapSurface/>}/><Route path="/route" element={<RouteSurface/>}/><Route path="/activity" element={<ActivitySurface/>}/><Route path="/play" element={<ProgressionPage/>}/><Route path="/play/quest" element={<ProgressionPage/>}/><Route path="/community" element={<SocialPage/>}/><Route path="/family" element={<FamilyPage/>}/><Route path="/evidence" element={<LocationEvidencePage/>}/><Route path="/engage" element={<EngagementPage/>}/><Route path="/intelligence" element={<IntelligencePage/>}/><Route path="/leaderboards" element={<IntelligencePage/>}/>
<Route path="/business" element={<BusinessManagePage/>}/><Route path="/business/intelligence" element={<BusinessIntelligencePage/>}/><Route path="/business/engage" element={<BusinessManagePage/>}/><Route path="/business/analytics" element={<BusinessIntelligencePage/>}/>
<Route path="/fleet" element={<FleetOperationsPage/>}/><Route path="/fleet/routes" element={<FleetOperationsPage/>}/><Route path="/fleet/performance" element={<FleetPerformancePage/>}/><Route path="/fleet/opportunities" element={<FleetOperationsPage/>}/><Route path="/fleet/goals" element={<FleetPerformancePage/>}/><Route path="/fleet/intelligence" element={<FleetIntelligenceSurface/>}/>
<Route path="/enterprise" element={<EnterpriseCommandCenterPage/>}/><Route path="/enterprise/partners" element={<EnterpriseCommandCenterPage/>}/><Route path="/enterprise/campaigns" element={<EnterpriseCommandCenterPage/>}/><Route path="/enterprise/performance" element={<EnterpriseCommandCenterPage/>}/><Route path="/enterprise/fleet" element={<EnterpriseCommandCenterPage/>}/>
<Route path="/admin" element={<OwnerControlCenter/>}/><Route path="/admin/maintenance" element={<AdminMaintenancePage/>}/><Route path="/consumer/actions" element={<ConsumerActionCenter/>}/><Route path="/engagement/orchestrate" element={<EngagementOrchestrator/>}/><Route path="/owner" element={<OwnerControlCenter/>}/><Route path="/owner/data" element={<OwnerCrudWorkbench/>}/><Route path="/owner/preview" element={<OwnerTierPreview/>}/><Route path="/owner/audit" element={<OwnerAuditPage/>}/>
<Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
