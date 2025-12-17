import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Users } from 'lucide-react';
import { Family } from '@/types';

type FamilyWithHead = Family & {
  head_of_family?: {
    full_name: string;
  };
};

interface FamilyMobileCardProps {
  family: FamilyWithHead;
  isSelected: boolean;
  onToggleSelection: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewMembers: () => void;
}

export const FamilyMobileCard = memo(({
  family,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onViewMembers,
}: FamilyMobileCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              className="mt-1"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{family.family_name}</h3>
                <Badge
                  variant={family.status === 'نشط' ? 'default' : 'secondary'}
                  className="text-xs shrink-0"
                >
                  {family.status}
                </Badge>
              </div>
              
              {family.head_of_family?.full_name && (
                <p className="text-xs text-muted-foreground truncate">
                  رب الأسرة: {family.head_of_family.full_name}
                </p>
              )}

              <div className="flex items-center flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 ms-1" />
                  {family.total_members} أفراد
                </Badge>
                {family.tribe && (
                  <Badge variant="secondary" className="text-xs">
                    {family.tribe}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                تاريخ التسجيل: {new Date(family.created_at).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/families/${family.id}`)}>
                <Eye className="ms-2 h-4 w-4" />
                شجرة العائلة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewMembers}>
                <Users className="ms-2 h-4 w-4" />
                عرض الأفراد ({family.total_members})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="ms-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="ms-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});

FamilyMobileCard.displayName = 'FamilyMobileCard';
