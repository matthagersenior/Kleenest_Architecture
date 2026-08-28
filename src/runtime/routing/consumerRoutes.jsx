import { Navigate, Route } from 'react-router-dom';
import { useAppContext } from '../../AppContext.jsx';
import { isPlatformOwner } from '../../domains/entitlements/access.js';
import Home from '../Home.jsx';
import MapSurface from '../MapSurface.jsx';
import RouteSurface from '../RouteSurface.jsx';
import RouteOutcomePage from '../RouteOutcomePage.jsx';
import SavedPage from '../SavedPage.jsx';
import FamilyPage from '../FamilyPage.jsx';
import LocationEvidencePage from '../LocationEvidencePage.jsx';
import ActivitySurface from '../ActivitySurface.jsx';
import SocialPage from '../SocialPage.jsx';
import CommunitySurface from '../CommunitySurface.jsx';
import ProgressionPage from '../ProgressionPage.jsx';
import QuestSurface from '../QuestSurface.jsx';
import GamesPage from '../GamesPage.jsx';
import OfflinePage from '../OfflinePage.jsx';
import OfflineJourneyPage from '../OfflineJourneyPage.jsx';
import AccessOffersPage from '../AccessOffersPage.jsx';
import EngagementSurface from '../EngagementSurface.jsx';
import ConsumerActionCenter from '../ConsumerActionCenter.jsx';
import EngagementOrchestrator from '../EngagementOrchestrator.jsx';

const PREVIEW_TIERS = ['free','premium','family','fleet','enterprise','business_standard','business_growth','business_fleet','business_enterprise'];

function OwnerAwareHome() {
  const { profile, loading, isPlatformOwner: contextOwner } = useAppContext();
  const owner = contextOwner || isPlatformOwner(profile);
  return loading ? <Home /> : owner ? <Navigate to="/owner" replace /> : <Home />;
}

export const consumerRoutes = [
  <Route key="root" path="/" element={<OwnerAwareHome />} />,
  <Route key="consumer" path="/consumer" element={<OwnerAwareHome />} />,
  <Route key="map" path="/map" element={<MapSurface />} />,
  <Route key="discover" path="/discover" element={<MapSurface />} />,
  <Route key="route" path="/route" element={<RouteSurface />} />,
  <Route key="route-complete" path="/route/complete" element={<RouteOutcomePage />} />,
  <Route key="saved" path="/saved" element={<SavedPage />} />,
  <Route key="activity" path="/activity" element={<ActivitySurface />} />,
  <Route key="play" path="/play" element={<ProgressionPage />} />,
  <Route key="play-quest" path="/play/quest" element={<QuestSurface />} />,
  <Route key="play-quests" path="/play/quests" element={<QuestSurface />} />,
  <Route key="quests" path="/quests" element={<QuestSurface />} />,
  <Route key="games" path="/games" element={<GamesPage />} />,
  <Route key="rewards" path="/rewards" element={<ProgressionPage />} />,
  <Route key="contests" path="/contests" element={<ProgressionPage />} />,
  <Route key="leaderboard" path="/leaderboard" element={<ProgressionPage />} />,
  <Route key="leaderboards" path="/leaderboards" element={<ProgressionPage />} />,
  <Route key="community" path="/community" element={<CommunitySurface />} />,
  <Route key="social" path="/social" element={<SocialPage />} />,
  <Route key="offline" path="/offline" element={<OfflinePage />} />,
  <Route key="offline-journey" path="/offline/journey" element={<OfflineJourneyPage />} />,
  <Route key="family" path="/family" element={<FamilyPage />} />,
  <Route key="access" path="/access" element={<AccessOffersPage />} />,
  <Route key="evidence" path="/evidence" element={<LocationEvidencePage />} />,
  <Route key="engage" path="/engage" element={<EngagementSurface />} />,
  <Route key="consumer-actions" path="/consumer/actions" element={<ConsumerActionCenter />} />,
  <Route key="engagement-orchestrate" path="/engagement/orchestrate" element={<EngagementOrchestrator />} />,
];

export { PREVIEW_TIERS };
