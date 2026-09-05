import { Navbar } from './Navbar';
import { SellerOnboardingPage } from './SellerOnboardingPage';
import { Footer } from './Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <SellerOnboardingPage onBackToHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <Footer />
    </>
  );
}
