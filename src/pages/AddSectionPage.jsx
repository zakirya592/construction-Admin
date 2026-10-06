import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { PageHeader } from "@/components/PageBits";
import { landingSections } from "@/landing/sections";

export function AddSectionPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader kicker="Landing" title="Add section" description="Choose the landing section you want to add." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {landingSections.map((section) => (
          <Button key={section.key} variant="outline" className="h-auto justify-start px-4 py-4" onPress={() => navigate(`${section.path}/new`)}>
            <span className="text-left">
              <span className="block font-medium">{section.name}</span>
              <span className="block text-xs text-stone-500">Order {section.order}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
