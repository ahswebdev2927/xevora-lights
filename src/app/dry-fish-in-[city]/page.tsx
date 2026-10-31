import LocationView from "@/components/LocationView";

export const dynamic = "force-dynamic";

interface DryFishInCityPageProps {
  params: Promise<{ city?: string }>;
}

export default async function DryFishInCityPage({ params }: DryFishInCityPageProps) {
  const resolvedParams = (await params) || {};
  const city = resolvedParams.city || "";
  return <LocationView city={city} />;
}
