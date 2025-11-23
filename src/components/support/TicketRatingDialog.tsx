import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAddTicketRating } from '@/hooks/useTicketRatings';

interface TicketRatingDialogProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketRatingDialog({
  ticketId,
  open,
  onOpenChange,
}: TicketRatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [responseSpeed, setResponseSpeed] = useState(0);
  const [solutionQuality, setSolutionQuality] = useState(0);
  const [staffFriendliness, setStaffFriendliness] = useState(0);
  const [feedback, setFeedback] = useState('');

  const addRating = useAddTicketRating();

  const handleSubmit = async () => {
    if (!ticketId || rating === 0) return;

    await addRating.mutateAsync({
      ticketId,
      rating,
      feedback,
      responseSpeedRating: responseSpeed || undefined,
      solutionQualityRating: solutionQuality || undefined,
      staffFriendlinessRating: staffFriendliness || undefined,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setRating(0);
    setResponseSpeed(0);
    setSolutionQuality(0);
    setStaffFriendliness(0);
    setFeedback('');
  };

  const RatingStars = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => label === 'التقييم العام' && setHoveredRating(star)}
            onMouseLeave={() => label === 'التقييم العام' && setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (label === 'التقييم العام' ? (hoveredRating || value) : value)
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>تقييم خدمة الدعم</DialogTitle>
          <DialogDescription>
            نود معرفة رأيك في جودة الخدمة المقدمة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RatingStars
            value={rating}
            onChange={setRating}
            label="التقييم العام"
          />

          <RatingStars
            value={responseSpeed}
            onChange={setResponseSpeed}
            label="سرعة الاستجابة"
          />

          <RatingStars
            value={solutionQuality}
            onChange={setSolutionQuality}
            label="جودة الحل"
          />

          <RatingStars
            value={staffFriendliness}
            onChange={setStaffFriendliness}
            label="لطف الموظفين"
          />

          <div className="space-y-2">
            <Label htmlFor="feedback">ملاحظات إضافية (اختياري)</Label>
            <Textarea
              id="feedback"
              placeholder="شاركنا رأيك وملاحظاتك..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || addRating.isPending}
            >
              {addRating.isPending ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
