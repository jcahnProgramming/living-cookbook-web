import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Library from './pages/Library';
import RecipeDetail from './pages/RecipeDetail';
import Plan from './pages/Plan';
import Grocery from './pages/Grocery';
import Settings from './pages/Settings';
import CookingMode from './pages/CookingMode';
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
      <Router>
        <div className="app">
          <Navigation />
          <main className="app__main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
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
      </Router>
    </ThemeProvider>
  );
}

export default App;