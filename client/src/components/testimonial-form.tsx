import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Upload, X } from "lucide-react";

interface TestimonialFormData {
  customerName: string;
  testimonial: string;
  service?: string;
  rating: number;
  customerPhoto?: string;
}

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TestimonialFormData) => void;
}

// Fetch services from API
const useServices = () => {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: () => apiRequest("/api/service-types", "GET"),
  });
};

export function TestimonialForm({
  open,
  onOpenChange,
  onSubmit,
}: TestimonialFormProps) {
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const [formData, setFormData] = useState<TestimonialFormData>({
    customerName: "",
    testimonial: "",
    service: "",
    rating: 5,
    customerPhoto: "",
  });
  const [previewImage, setPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
        setFormData((prev) => ({ ...prev, customerPhoto: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage("");
    setFormData((prev) => ({ ...prev, customerPhoto: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.testimonial.trim()) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
    // Reset form
    setFormData({
      customerName: "",
      testimonial: "",
      service: "",
      rating: 5,
      customerPhoto: "",
    });
    setPreviewImage("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData({
      customerName: "",
      testimonial: "",
      service: "",
      rating: 5,
      customerPhoto: "",
    });
    setPreviewImage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer Testimonial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Photo Upload */}
          <div className="space-y-2">
            <Label>Customer Photo (Optional)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {previewImage ? (
                  <AvatarImage src={previewImage} alt="Customer" />
                ) : (
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    <Upload className="h-6 w-6" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {previewImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
              placeholder="Enter customer name"
              required
            />
          </div>

                     {/* Service */}
           <div className="space-y-2">
             <Label htmlFor="service">Service Received</Label>
             <Select
               value={formData.service}
               onValueChange={(value) =>
                 setFormData((prev) => ({ ...prev, service: value }))
               }
               disabled={servicesLoading}
             >
               <SelectTrigger>
                 <SelectValue placeholder={servicesLoading ? "Loading services..." : "Select service (optional)"} />
               </SelectTrigger>
               <SelectContent>
                 {services.map((service: any) => (
                   <SelectItem key={service.id} value={service.name}>
                     {service.name}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= formData.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating} star{formData.rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="space-y-2">
            <Label htmlFor="testimonial">Testimonial *</Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  testimonial: e.target.value,
                }))
              }
              placeholder="Enter customer testimonial..."
              rows={4}
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Testimonial</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
