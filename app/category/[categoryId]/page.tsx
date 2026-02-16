import { CategoryPage } from "@/components/category-page";
import { Category } from "@/lib/types";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const { categoryId } = await params;
  const { region } = await searchParams;

  return (
    <CategoryPage
      categoryId={categoryId as Category}
      initialRegion={region}
    />
  );
}
