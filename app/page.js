import dynamic from 'next/dynamic';

// Load with ssr:false — the site uses GSAP + window extensively
const WeddingSite = dynamic(() => import('../components/WeddingSite'), {
  ssr: false,
  loading: () => null,
});

export default function Page() {
  return <WeddingSite />;
}
