import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/ui/use-toast';
import { NotificationService } from '@/services/notification.service';
import { Bell, Mail, MessageSquare, Smartphone, Send, Plus, Edit2, Trash2, LucideIcon } from 'lucide-react';

type NotificationChannel = 'app' | 'email' | 'sms' | 'whatsapp' | 'push';

interface NotificationTemplate {
  id: string;
  name: string;
  title_ar: string;
  body_ar: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high';
  variables: string[];
}

const channelIcons: Record<NotificationChannel, LucideIcon> = {
  app: Bell,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  push: Smartphone,
};

const defaultTemplates: NotificationTemplate[] = [
  {
    id: 'distribution_approved',
    name: 'موافقة على التوزيع',
    title_ar: 'تم الموافقة على التوزيع',
    body_ar: 'تم الموافقة على توزيع رقم {{distribution_number}} بمبلغ {{amount}} ريال',
    channels: ['app', 'email', 'sms'],
    priority: 'high',
    variables: ['distribution_number', 'amount'],
  },
  {
    id: 'payment_received',
    name: 'استلام دفعة',
    title_ar: 'تم استلام دفعة جديدة',
    body_ar: 'عزيزي {{beneficiary_name}}، تم إيداع مبلغ {{amount}} ريال في حسابك',
    channels: ['app', 'email', 'sms', 'whatsapp'],
    priority: 'high',
    variables: ['beneficiary_name', 'amount'],
  },
];

export function NotificationTemplateEditor() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<NotificationTemplate>>({
    name: '',
    title_ar: '',
    body_ar: '',
    channels: ['app'],
    priority: 'medium',
    variables: [],
  });

  const handleSave = () => {
    if (!formData.name || !formData.title_ar || !formData.body_ar) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    const template: NotificationTemplate = {
      id: editingTemplate?.id || `custom_${Date.now()}`,
      name: formData.name!,
      title_ar: formData.title_ar!,
      body_ar: formData.body_ar!,
      channels: formData.channels!,
      priority: formData.priority!,
      variables: formData.variables!,
    };

    const updatedTemplates = editingTemplate 
      ? templates.map(t => t.id === template.id ? template : t)
      : [...templates, template];
    
    setTemplates(updatedTemplates);

    toast({
      title: 'تم بنجاح',
      description: editingTemplate ? 'تم تحديث القالب' : 'تم إنشاء القالب',
    });

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title_ar: '',
      body_ar: '',
      channels: ['app'],
      priority: 'medium',
      variables: [],
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setFormData(template);
    setEditingTemplate(template);
    setIsCreating(true);
  };

  const toggleChannel = (channel: NotificationChannel) => {
    const currentChannels = formData.channels || [];
    if (currentChannels.includes(channel)) {
      setFormData({
        ...formData,
        channels: currentChannels.filter(c => c !== channel),
      });
    } else {
      setFormData({
        ...formData,
        channels: [...currentChannels, channel],
      });
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, m => m[1])));
  };

  const handleBodyChange = (value: string) => {
    setFormData({
      ...formData,
      body_ar: value,
      variables: extractVariables(value),
    });
  };

  if (isCreating) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {editingTemplate ? 'تعديل القالب' : 'قالب إشعار جديد'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              إلغاء
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم القالب</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: موافقة على التوزيع"
              />
            </div>

            <div>
              <Label htmlFor="title">العنوان (عربي)</Label>
              <Input
                id="title"
                value={formData.title_ar}
                onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="عنوان الإشعار"
              />
            </div>

            <div>
              <Label htmlFor="body">المحتوى (عربي)</Label>
              <Textarea
                id="body"
                value={formData.body_ar}
                onChange={e => handleBodyChange(e.target.value)}
                placeholder="محتوى الإشعار. استخدم {{variable}} للمتغيرات"
                rows={4}
              />
              {formData.variables && formData.variables.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-sm text-muted-foreground">المتغيرات:</span>
                  {formData.variables.map(variable => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>قنوات الإرسال</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(['app', 'email', 'sms', 'whatsapp', 'push'] as NotificationChannel[]).map(
                  channel => {
                    const Icon = channelIcons[channel];
                    const isSelected = formData.channels?.includes(channel);
                    return (
                      <Button
                        key={channel}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleChannel(channel)}
                      >
                        <Icon className="h-4 w-4 ms-2" />
                        {channel === 'app' && 'التطبيق'}
                        {channel === 'email' && 'بريد'}
                        {channel === 'sms' && 'SMS'}
                        {channel === 'whatsapp' && 'واتساب'}
                        {channel === 'push' && 'Push'}
                      </Button>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <Label>الأولوية</Label>
              <div className="flex gap-2 mt-2">
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <Button
                    key={priority}
                    variant={formData.priority === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, priority })}
                  >
                    {priority === 'low' && 'منخفضة'}
                    {priority === 'medium' && 'متوسطة'}
                    {priority === 'high' && 'عالية'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {editingTemplate ? 'تحديث القالب' : 'إنشاء القالب'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">قوالب الإشعارات</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 ms-2" />
          قالب جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map(template => (
          <Card key={template.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{template.name}</h4>
                  <Badge
                    variant={
                      template.priority === 'high'
                        ? 'destructive'
                        : template.priority === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {template.priority === 'low' && 'منخفضة'}
                    {template.priority === 'medium' && 'متوسطة'}
                    {template.priority === 'high' && 'عالية'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{template.title_ar}</p>
                <p className="text-sm mb-3">{template.body_ar}</p>
                <div className="flex items-center gap-2">
                  {template.channels.map(channel => {
                    const Icon = channelIcons[channel];
                    return (
                      <div
                        key={channel}
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                      >
                        <Icon className="h-3 w-3" />
                        {channel === 'app' && 'تطبيق'}
                        {channel === 'email' && 'بريد'}
                        {channel === 'sms' && 'SMS'}
                        {channel === 'whatsapp' && 'واتساب'}
                        {channel === 'push' && 'Push'}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
