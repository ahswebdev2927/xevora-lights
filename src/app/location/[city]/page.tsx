import LocationView from "@/components/LocationView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface LocationPageProps {
  params: Promise<{ city?: string }>;
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = (await params) || {};
  const city = resolvedParams.city || "";

  if (city && city.toLowerCase() === "wholesale") {
    redirect("/contact");
  }
  return <LocationView city={city} />;
}
