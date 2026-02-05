import {
  ArrowRight,
  Calendar,
  Download,
  ExternalLink,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ButtonsShowcase() {
  return (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <div>
        <h4 className="mb-4 font-medium text-muted-foreground text-sm">
          Primary Buttons
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button>Default</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button className="gap-2">
            Schedule Consultation
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button className="gap-2">
            <Phone className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </div>

      {/* Secondary/Outline Buttons */}
      <div>
        <h4 className="mb-4 font-medium text-muted-foreground text-sm">
          Outline Buttons
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline">Outline</Button>
          <Button size="sm" variant="outline">
            Small Outline
          </Button>
          <Button className="gap-2 bg-transparent" variant="outline">
            View Services
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Ghost & Secondary Buttons */}
      <div>
        <h4 className="mb-4 font-medium text-muted-foreground text-sm">
          Ghost & Secondary
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost">Ghost</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="link">Link Button</Button>
          <Button className="gap-1" variant="link">
            Learn More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Destructive */}
      <div>
        <h4 className="mb-4 font-medium text-muted-foreground text-sm">
          Destructive
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="destructive">Delete</Button>
          <Button size="sm" variant="destructive">
            Remove
          </Button>
        </div>
      </div>

      {/* Icon Buttons */}
      <div>
        <h4 className="mb-4 font-medium text-muted-foreground text-sm">
          Icon Buttons
        </h4>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
