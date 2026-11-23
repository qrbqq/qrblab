import {useEffect} from 'react';
import {HashRouter, Route, Routes, useLocation} from 'react-router-dom';
import {Footer} from './components/Footer';
import {Navbar} from './components/Navbar';
import {LanguageProvider} from './context/LanguageContext';
import {ThemeProvider} from './context/ThemeContext';
import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {NotFoundPage} from './pages/NotFoundPage';
import {PaperDetailPage} from './pages/PaperDetailPage';
import {ResearchPage} from './pages/ResearchPage';

function ScrollToTop() {
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/research/:slug" element={<PaperDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
