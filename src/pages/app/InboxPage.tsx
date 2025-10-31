import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Mail, Plus } from 'lucide-react';

import ConversationList from '@/components/inbox/ConversationList';
import MessageThread from '@/components/inbox/MessageThread';
import MessageComposer from '@/components/inbox/MessageComposer';
import ContactContextPanel from '@/components/inbox/ContactContextPanel';
import InboxFilters from '@/components/inbox/InboxFilters';
import { useInboxStore } from '@/lib/stores/inboxStore';

import { fetchConversations, fetchMessages, sendMessage, markAsRead } from '@/lib/api/inbox';
import { useSession } from '@/lib/hooks/useSession';
import { canCurrentUser } from '@/lib/rbac/can';
import { Role } from '@/lib/rbac/permissions';

const InboxPage = () => {
  const {
    selectedConversationId,
    contextPanelOpen,
    activeFilters,
    searchQuery,
    setSelectedConversation,
    toggleContextPanel,
    setFilters,
    clearFilters,
    setSearchQuery,
  } = useInboxStore();

  const { role } = useSession();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', activeFilters],
    queryFn: () => fetchConversations(activeFilters),
  });

  // Fetch selected conversation messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => selectedConversationId ? fetchMessages(selectedConversationId) : Promise.resolve([]),
    enabled: !!selectedConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content, channel, scheduledFor }: any) =>
      sendMessage(conversationId, content, channel, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation.id);
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversation.id);
    }
  };

  const handleSendMessage = async (content: string, channel: any, scheduledFor?: string) => {
    if (!selectedConversationId) return;
    
    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversationId,
      content,
      channel,
      scheduledFor,
    });
  };

  const canSendMessages = role ? canCurrentUser('create', 'messages', role.role as Role) : false;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">
            Unified email and SMS communications
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b">
        <InboxFilters
          filters={activeFilters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Conversation List */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={handleSelectConversation}
              isLoading={conversationsLoading}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Message Thread */}
          <ResizablePanel defaultSize={contextPanelOpen ? 45 : 70}>
            <div className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <MessageThread
                    messages={messages}
                    isLoading={messagesLoading}
                    className="flex-1"
                  />
                  {canSendMessages && (
                    <MessageComposer
                      conversationId={selectedConversation.id}
                      channel={selectedConversation.channel}
                      onSendMessage={handleSendMessage}
                      disabled={sendMessageMutation.isPending}
                    />
                  )}
                </>
              ) : (
                <Card className="h-full flex items-center justify-center m-4">
                  <div className="text-center">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation to view messages
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>

          {/* Context Panel */}
          {contextPanelOpen && selectedConversation && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={25} minSize={20}>
                <ContactContextPanel
                  conversation={selectedConversation}
                  onViewContact={() => {}}
                  onCreateDeal={() => {}}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default InboxPage;