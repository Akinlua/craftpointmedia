import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, DollarSign, CheckSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockContacts } from "@/lib/mocks/contacts";
import { mockDeals } from "@/lib/mocks/deals";
import { mockTasks } from "@/lib/mocks/tasks";

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearchModal = ({ open, onOpenChange }: GlobalSearchModalProps) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Filter results based on query
  const filteredContacts = mockContacts.filter(contact =>
    contact.firstName.toLowerCase().includes(query.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(query.toLowerCase()) ||
    contact.email.toLowerCase().includes(query.toLowerCase()) ||
    contact.company?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredDeals = mockDeals.filter(deal =>
    deal.title.toLowerCase().includes(query.toLowerCase()) ||
    deal.stage.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredTasks = mockTasks.filter(task =>
    task.title.toLowerCase().includes(query.toLowerCase()) ||
    task.description?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const hasResults = filteredContacts.length > 0 || filteredDeals.length > 0 || filteredTasks.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery("");
  };

  const handleClose = () => {
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden glass-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Global Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts, deals, tasks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 premium-input"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {query && (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {!hasResults && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No results found for "{query}"</p>
                </div>
              )}

              {filteredContacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contacts
                  </h3>
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors animate-fade-in"
                        onClick={() => handleNavigate(`/app/contacts/${contact.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            {contact.company && (
                              <p className="text-xs text-muted-foreground">{contact.company}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {contact.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredDeals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Deals
                  </h3>
                  <div className="space-y-2">
                    {filteredDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors animate-fade-in"
                        onClick={() => handleNavigate(`/app/deals/${deal.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-sm text-muted-foreground">
                              ${deal.value.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {deal.stage}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                  </h3>
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors animate-fade-in"
                        onClick={() => handleNavigate("/app/tasks")}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            variant={task.completedAt ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {task.completedAt ? "Done" : task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!query && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">Search everything</p>
              <p className="text-sm">Find contacts, deals, and tasks quickly</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};