import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, LifeBuoy, BookOpen, HelpCircle, MessageCircle } from 'lucide-react';
import { CreateTicketDialog } from '@/components/support/CreateTicketDialog';
import { MyTicketsList } from '@/components/support/MyTicketsList';
import { KnowledgeBaseView } from '@/components/support/KnowledgeBaseView';
import { FAQList } from '@/components/support/FAQList';

export default function Support() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الدعم الفني</h1>
          <p className="text-muted-foreground">
            نحن هنا لمساعدتك في حل أي مشكلة أو الإجابة على استفساراتك
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <Plus className="ml-2 h-4 w-4" />
          تذكرة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LifeBuoy className="h-4 w-4" />
              التذاكر المفتوحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              قيد المعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              المقالات المفيدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              الأسئلة الشائعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-tickets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-tickets">
            <LifeBuoy className="ml-2 h-4 w-4" />
            تذاكري
          </TabsTrigger>
          <TabsTrigger value="knowledge-base">
            <BookOpen className="ml-2 h-4 w-4" />
            قاعدة المعرفة
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="ml-2 h-4 w-4" />
            الأسئلة الشائعة
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="ml-2 h-4 w-4" />
            الدردشة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          <MyTicketsList />
        </TabsContent>

        <TabsContent value="knowledge-base" className="space-y-4">
          <KnowledgeBaseView />
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <FAQList />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الدردشة المباشرة</CardTitle>
              <CardDescription>
                تواصل مع فريق الدعم الفني مباشرة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                الدردشة المباشرة قيد التطوير...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateTicketDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
