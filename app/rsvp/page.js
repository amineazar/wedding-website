import dynamic from 'next/dynamic';

const WeddingSite = dynamic(() => import('../../components/WeddingSite'), {
  ssr: false,
  loading: () => null,
});

export default function RsvpPage() {
  return <WeddingSite />;
}
