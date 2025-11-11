import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DeviceFeedbackFormProps {
  deviceId: string;
  customerId?: string;
  locationId?: string;
  deviceInfo?: {
    problemDescription: string;
    customerName?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceFeedbackForm({
  deviceId,
  customerId,
  locationId,
  deviceInfo,
  isOpen,
  onClose,
}: DeviceFeedbackFormProps) {
  const [rating, setRating] = useState(5);
  const [overallSatisfaction, setOverallSatisfaction] = useState(5);
  const [serviceQuality, setServiceQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comments, setComments] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: any) => {
      return apiRequest("/api/feedback/submit", "POST", feedbackData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      onClose();
      // Reset form
      setRating(5);
      setOverallSatisfaction(5);
      setServiceQuality(5);
      setCommunication(5);
      setTimeliness(5);
      setValueForMoney(5);
      setComments("");
      setWouldRecommend(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const feedbackData = {
      deviceId,
      customerId,
      locationId,
      rating,
      overallSatisfaction,
      serviceQuality,
      communication,
      timeliness,
      valueForMoney,
      comments,
      wouldRecommend,
    };

    submitFeedbackMutation.mutate(feedbackData);
  };

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-gray-500">
        {value === 1 && "Poor"}
        {value === 2 && "Fair"}
        {value === 3 && "Good"}
        {value === 4 && "Very Good"}
        {value === 5 && "Excellent"}
      </span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Service Feedback
          </DialogTitle>
          <DialogDescription>
            Please share your experience with our repair service. Your feedback
            helps us improve!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {deviceInfo && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Device Issue:</strong> {deviceInfo.problemDescription}
              </p>
              {deviceInfo.customerName && (
                <p className="text-sm text-gray-600">
                  <strong>Customer:</strong> {deviceInfo.customerName}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {renderStarRating(rating, setRating, "Overall Rating")}
            {renderStarRating(
              overallSatisfaction,
              setOverallSatisfaction,
              "Overall Satisfaction"
            )}
            {renderStarRating(
              serviceQuality,
              setServiceQuality,
              "Service Quality"
            )}
            {renderStarRating(communication, setCommunication, "Communication")}
            {renderStarRating(timeliness, setTimeliness, "Timeliness")}
            {renderStarRating(
              valueForMoney,
              setValueForMoney,
              "Value for Money"
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Would you recommend us?
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={wouldRecommend}
                  onChange={() => setWouldRecommend(true)}
                  className="text-blue-600"
                />
                Yes, definitely
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!wouldRecommend}
                  onChange={() => setWouldRecommend(false)}
                  className="text-blue-600"
                />
                No, probably not
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitFeedbackMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitFeedbackMutation.isPending}>
              {submitFeedbackMutation.isPending
                ? "Submitting..."
                : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}