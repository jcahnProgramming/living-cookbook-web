import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Library from './pages/Library';
import RecipeDetail from './pages/RecipeDetail';
import FollowingFeed from './pages/FollowingFeed';
import ExploreFeed from './pages/ExploreFeed';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Notifications from './pages/Notifications';
import Plan from './pages/Plan';
import Grocery from './pages/Grocery';
import Settings from './pages/Settings';
import CookingMode from './pages/CookingMode';
import CreateMealPost from './pages/CreateMealPost';
import Household from './pages/Household';
import Marketplace from './pages/Marketplace';
import MyKitchen from './pages/MyKitchen';
import NotFound from './pages/NotFound';
import './styles/tokens.css';
import './styles/tokens-extended.css';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navigation />
            <main className="app__main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/feed" element={<FollowingFeed />} />
                <Route path="/explore" element={<ExploreFeed />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/grocery" element={<Grocery />} />
                <Route path="/household" element={<Household />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/my-kitchen" element={<MyKitchen />} />
                <Route path="/cooking/:recipeId" element={<CookingMode />} />
                <Route path="/create-meal-post" element={<CreateMealPost />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;