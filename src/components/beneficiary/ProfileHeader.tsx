import { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Shield, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Beneficiary } from '@/types/beneficiary';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { EditPhoneDialog } from './EditPhoneDialog';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQueryClient } from '@tanstack/react-query';

interface ProfileHeaderProps {
  beneficiary: Beneficiary;
}

export function ProfileHeader({ beneficiary }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { isBeneficiary, isWaqfHeir } = useUserRole();
  const queryClient = useQueryClient();
  const [editPhoneOpen, setEditPhoneOpen] = useState(false);
  
  // Check if current user is the beneficiary owner
  const isOwner = user?.id === beneficiary.user_id;
  const canEditPhone = (isBeneficiary || isWaqfHeir) && isOwner;

  const handlePhoneUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
    queryClient.invalidateQueries({ queryKey: ["beneficiary-profile"] });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'نشط':
        return 'bg-success-light text-success border-success/20';
      case 'معلق':
        return 'bg-warning-light text-warning border-warning/20';
      case 'غير نشط':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-info-light text-info border-info/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'الفئة الأولى':
        return 'bg-secondary text-secondary-foreground border-secondary/20';
      case 'الفئة الثانية':
        return 'bg-info-light text-info border-info/20';
      case 'الفئة الثالثة':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-primary/10">
              <AvatarFallback className="text-2xl md:text-3xl bg-primary/10 text-primary">
                {getInitials(beneficiary.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Name & Badges */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {beneficiary.full_name}
                  </h1>
                  {beneficiary.beneficiary_number && (
                    <p className="text-sm text-muted-foreground mt-1">
                      رقم العضوية: <span className="font-mono font-semibold text-primary">{beneficiary.beneficiary_number}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {beneficiary.can_login && (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="h-3 w-3" />
                      دخول مفعّل
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(beneficiary.category)}>
                  {beneficiary.category}
                </Badge>
                <Badge className={getStatusColor(beneficiary.status)}>
                  {beneficiary.status}
                </Badge>
                {beneficiary.tribe && (
                  <Badge variant="outline">
                    {beneficiary.tribe}
                  </Badge>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>رقم الهوية: {beneficiary.national_id}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{beneficiary.phone}</span>
                {canEditPhone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditPhoneOpen(true)}
                    className="h-6 px-2 text-xs gap-1 mr-2"
                  >
                    <Edit2 className="h-3 w-3" />
                    تعديل
                  </Button>
                )}
              </div>

              {beneficiary.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{beneficiary.email}</span>
                </div>
              )}

              {beneficiary.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{beneficiary.city}</span>
                </div>
              )}

              {beneficiary.date_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    تاريخ الميلاد: {format(new Date(beneficiary.date_of_birth), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {beneficiary.notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">ملاحظات: </span>
                  {beneficiary.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Edit Phone Dialog */}
      <EditPhoneDialog
        open={editPhoneOpen}
        onOpenChange={setEditPhoneOpen}
        beneficiaryId={beneficiary.id}
        currentPhone={beneficiary.phone}
        onSuccess={handlePhoneUpdateSuccess}
      />
    </Card>
  );
}
