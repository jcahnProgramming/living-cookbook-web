import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@/styles/global.css';

// Placeholder components (we'll create these next)
import HomePage from '@/pages/Home';
import LibraryPage from '@/pages/Library';
import RecipeDetailPage from '@/pages/RecipeDetail';
import CookingModePage from '@/pages/CookingMode';
import PlanPage from '@/pages/Plan';
import GroceryPage from '@/pages/Grocery';
import MyKitchenPage from '@/pages/MyKitchen';
import HouseholdPage from '@/pages/Household';
import MarketplacePage from '@/pages/Marketplace';
import SettingsPage from '@/pages/Settings';
import NotFoundPage from '@/pages/NotFound';

// Layout
import MainLayout from '@/components/layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main routes with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/grocery" element={<GroceryPage />} />
          <Route path="/kitchen" element={<MyKitchenPage />} />
          <Route path="/household" element={<HouseholdPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Cooking mode - full screen, no nav */}
        <Route path="/cook/:id" element={<CookingModePage />} />
      </Routes>
    </Router>
  );
}

export default App;
