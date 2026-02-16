import { SearchPage } from "@/components/search-page";

export const runtime = "edge";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return <SearchPage query={q || ""} />;
}
