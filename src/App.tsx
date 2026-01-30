import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Library from './pages/Library';
import RecipeDetail from './pages/RecipeDetail';
import RecipeBuilder from './pages/RecipeBuilder';
import RecipeEditor from './pages/RecipeEditor';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import UserSearch from './pages/UserSearch';
import CreateMealPost from './pages/CreateMealPost';
import Plan from './pages/Plan';
import Grocery from './pages/Grocery';
import Settings from './pages/Settings';
import CookingMode from './pages/CookingMode';
import Household from './pages/Household';
import AcceptInvitation from './pages/AcceptInvitation';
import Marketplace from './pages/Marketplace';
import MyKitchen from './pages/MyKitchen';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import './styles/tokens.css';
import './styles/tokens-extended.css';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Public Invitation Route */}
            <Route path="/household/join/:token" element={<AcceptInvitation />} />

            {/* Protected Routes */}
            <Route path="*" element={
              <ProtectedRoute>
                <div className="app">
                  <Navigation />
                  <main className="app__main">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/library" element={<Library />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:userId" element={<Profile />} />
                      <Route path="/profile/edit" element={<ProfileEdit />} />
                      <Route path="/people" element={<UserSearch />} />
                      <Route path="/meals/create" element={<CreateMealPost />} />
                      <Route path="/recipe/:id" element={<RecipeDetail />} />
                      <Route path="/recipe/create" element={<RecipeBuilder />} />
                      <Route path="/recipe/edit/:id" element={<RecipeEditor />} />
                      <Route path="/plan" element={<Plan />} />
                      <Route path="/grocery" element={<Grocery />} />
                      <Route path="/household" element={<Household />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/my-kitchen" element={<MyKitchen />} />
                      <Route path="/cooking/:id" element={<CookingMode />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;